'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ChatUseCases } from '../chat.module.ts';
import { ConversationNotFoundError } from '../domain/chat.errors.ts';
import { byRecentActivity, type Conversation } from '../domain/conversation.ts';
import { createMessage, type Message } from '../domain/message.ts';

/**
 * - `loading`: fetching the conversation's messages.
 * - `missing`: it does not exist (deleted, or a bad link).
 * - `idle`: ready to send.
 * - `waiting`: sent, no part of the answer yet.
 * - `streaming`: the answer is arriving.
 */
export type ThreadStatus = 'loading' | 'missing' | 'idle' | 'waiting' | 'streaming';

export interface Thread {
  messages: Message[];
  status: ThreadStatus;
  error: string | null;
}

/** Key of the thread typed at `/`, before its conversation exists. */
const NEW_CHAT = '__new__';
const EMPTY_THREAD: Thread = { messages: [], status: 'idle', error: null };

interface ChatContextValue {
  /** `null` while the list loads. */
  conversations: Conversation[] | null;
  conversationsError: string | null;
  /** The thread of a conversation, or of the new chat (`null`). */
  thread(conversationId: string | null): Thread;
  /** Loads a conversation's messages, unless they are already here. */
  open(conversationId: string): void;
  /**
   * Sends a message; with `conversationId` null it starts a conversation
   * and calls `onStarted` with its id. False when nothing was sent.
   */
  send(
    conversationId: string | null,
    text: string,
    onStarted?: (conversationId: string) => void,
  ): Promise<boolean>;
  stop(conversationId: string | null): void;
  remove(conversationId: string): Promise<void>;
  dismissError(conversationId: string | null): void;
  models: string[];
  model: string | undefined;
  setModel(model: string): void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * The chat state of the signed-in app: the conversation list and a thread
 * per conversation. It lives in the layout, so an answer keeps streaming
 * while the user switches conversations. Nothing here knows about HTTP: it
 * only calls the use cases.
 */
export function ChatProvider({
  useCases,
  children,
}: {
  useCases: ChatUseCases;
  children: ReactNode;
}) {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState<string | undefined>();
  // Mirrors `threads` for reads inside callbacks without re-creating them.
  const threadsRef = useRef(threads);
  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);
  const aborts = useRef(new Map<string, AbortController>());

  const updateThread = useCallback((key: string, change: (thread: Thread) => Thread) => {
    setThreads((current) => ({ ...current, [key]: change(current[key] ?? EMPTY_THREAD) }));
  }, []);

  /** Adds or replaces a conversation in the list, keeping its order. */
  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((current) =>
      [...(current ?? []).filter((c) => c.id !== conversation.id), conversation].sort(
        byRecentActivity,
      ),
    );
  }, []);

  const forgetConversation = useCallback((conversationId: string) => {
    aborts.current.get(conversationId)?.abort();
    setConversations((current) => current?.filter((c) => c.id !== conversationId) ?? null);
    setThreads((current) => {
      const rest = { ...current };
      delete rest[conversationId];
      return rest;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    useCases.listConversations
      .execute()
      .then((list) => !cancelled && setConversations(list))
      .catch((e) => !cancelled && setConversationsError(errorMessage(e)));
    useCases.listModels
      .execute()
      .then((available) => {
        if (cancelled) return;
        setModels(available.models);
        setModel((current) => current ?? available.default);
      })
      // No list: the picker stays hidden and the API uses its default.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [useCases]);

  // Signing out unmounts the provider: stop every answer in flight.
  useEffect(() => {
    const inFlight = aborts.current;
    return () => inFlight.forEach((controller) => controller.abort());
  }, []);

  const open = useCallback(
    (conversationId: string) => {
      const existing = threadsRef.current[conversationId];
      if (existing && existing.status !== 'missing') return;
      updateThread(conversationId, () => ({ ...EMPTY_THREAD, status: 'loading' }));
      useCases.getConversation
        .execute(conversationId)
        .then(({ messages }) =>
          updateThread(conversationId, () => ({ messages, status: 'idle', error: null })),
        )
        .catch((e) =>
          updateThread(conversationId, () =>
            e instanceof ConversationNotFoundError
              ? { ...EMPTY_THREAD, status: 'missing' }
              : { ...EMPTY_THREAD, error: errorMessage(e) },
          ),
        );
    },
    [useCases, updateThread],
  );

  const send = useCallback(
    async (
      conversationId: string | null,
      text: string,
      onStarted?: (conversationId: string) => void,
    ): Promise<boolean> => {
      let key = conversationId ?? NEW_CHAT;
      if ((threadsRef.current[key]?.status ?? 'idle') !== 'idle' || !text.trim()) return false;

      // The user's message shows at once, even before the conversation exists.
      updateThread(key, (thread) => ({
        messages: [...thread.messages, createMessage('user', text)],
        status: 'waiting',
        error: null,
      }));

      // Registered right away, so stop works while waiting too.
      const controller = new AbortController();
      aborts.current.set(key, controller);
      try {
        const { conversationId: id, started, events } = await useCases.sendMessage.execute(text, {
          conversationId,
          model,
          signal: controller.signal,
        });
        if (started) {
          // The new chat becomes this conversation's thread; `/` starts over.
          setThreads((current) => {
            const { [NEW_CHAT]: moved = EMPTY_THREAD, ...rest } = current;
            return { ...rest, [id]: moved };
          });
          aborts.current.delete(NEW_CHAT);
          aborts.current.set(id, controller);
          key = id;
          upsertConversation(started);
          onStarted?.(id);
        }
        const answer = createMessage('assistant', '');
        let content = '';
        for await (const event of events) {
          if (event.type === 'conversation') {
            upsertConversation(event.conversation);
            continue;
          }
          content += event.text;
          const message = { ...answer, content };
          // The answer's bubble appears with its first chunk, replacing the dots.
          updateThread(key, (thread) => ({
            ...thread,
            status: 'streaming',
            messages:
              thread.messages.at(-1)?.id === answer.id
                ? [...thread.messages.slice(0, -1), message]
                : [...thread.messages, message],
          }));
        }
      } catch (e) {
        if (e instanceof ConversationNotFoundError) {
          forgetConversation(key);
          updateThread(key, () => ({ ...EMPTY_THREAD, status: 'missing' }));
          return true;
        }
        // Stopped by the user: keep what arrived, no error.
        if (!controller.signal.aborted) {
          updateThread(key, (thread) => ({ ...thread, error: errorMessage(e) }));
        }
      } finally {
        aborts.current.delete(key);
        updateThread(key, (thread) =>
          thread.status === 'missing' ? thread : { ...thread, status: 'idle' },
        );
      }
      return true;
    },
    [useCases, model, updateThread, upsertConversation, forgetConversation],
  );

  const remove = useCallback(
    async (conversationId: string) => {
      try {
        await useCases.deleteConversation.execute(conversationId);
      } catch (e) {
        // Already gone elsewhere: the goal is reached.
        if (!(e instanceof ConversationNotFoundError)) throw e;
      }
      forgetConversation(conversationId);
    },
    [useCases, forgetConversation],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      conversationsError,
      thread: (conversationId) => threads[conversationId ?? NEW_CHAT] ?? EMPTY_THREAD,
      open,
      send,
      stop: (conversationId) => aborts.current.get(conversationId ?? NEW_CHAT)?.abort(),
      remove,
      dismissError: (conversationId) =>
        updateThread(conversationId ?? NEW_CHAT, (thread) => ({ ...thread, error: null })),
      models,
      model,
      setModel,
    }),
    [conversations, conversationsError, threads, open, send, remove, updateThread, models, model],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChat(): ChatContextValue {
  const context = use(ChatContext);
  if (!context) throw new Error('useChat must be used inside <ChatProvider>');
  return context;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}
