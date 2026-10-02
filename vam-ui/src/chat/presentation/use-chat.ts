'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatUseCases } from '../chat.module.ts';
import { createMessage, type Message } from '../domain/message.ts';

/**
 * - `idle`: ready to send.
 * - `waiting`: sent, no part of the answer yet.
 * - `streaming`: the answer is arriving.
 */
export type ChatStatus = 'idle' | 'waiting' | 'streaming';

/**
 * Conversation state for one page visit: the user's message shows up at
 * once, the answer grows as it streams in. Nothing is stored (no memory yet).
 */
export function useChat({ sendMessage, listModels }: ChatUseCases) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    listModels
      .execute()
      .then((available) => {
        if (cancelled) return;
        setModels(available.models);
        setModel((current) => current ?? available.default);
      })
      // No list: the selector stays hidden and the API uses its default.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listModels]);

  // Leaving the page stops the answer (and, through the API, the model).
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Sends `content`; returns false when there was nothing to send. */
  async function send(content: string): Promise<boolean> {
    if (status !== 'idle' || !content.trim()) return false;

    let chunks: AsyncIterable<string>;
    const controller = new AbortController();
    try {
      chunks = sendMessage.execute(content, { model, signal: controller.signal });
    } catch (e) {
      setError(errorMessage(e));
      return false;
    }

    abortRef.current = controller;
    setMessages((current) => [...current, createMessage('user', content)]);
    setStatus('waiting');
    setError(null);

    // The answer's bubble appears with its first chunk, replacing the dots.
    const answer = createMessage('assistant', '');
    let text = '';
    try {
      for await (const chunk of chunks) {
        text += chunk;
        const content = text;
        setMessages((current) =>
          current.at(-1)?.id === answer.id
            ? [...current.slice(0, -1), { ...answer, content }]
            : [...current, { ...answer, content }],
        );
        setStatus('streaming');
      }
    } catch (e) {
      // Stopped by the user: keep what arrived, no error.
      if (!controller.signal.aborted) setError(errorMessage(e));
    } finally {
      abortRef.current = null;
      setStatus('idle');
    }
    return true;
  }

  return {
    messages,
    status,
    error,
    models,
    model,
    setModel,
    send,
    stop: () => abortRef.current?.abort(),
    dismissError: () => setError(null),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}
