import { ConversationRepository } from '../domain/conversation.repository.ts';
import type { Conversation } from '../domain/conversation.ts';
import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { MESSAGE_MAX_LENGTH } from '../domain/message.ts';
import { Assistant, type AssistantEvent } from './ports/assistant.ts';

export interface SendMessageOptions {
  /** The conversation to continue; a new one is started when missing. */
  conversationId?: string | null;
  model?: string;
  signal?: AbortSignal;
}

export interface SendMessageResult {
  conversationId: string;
  /** The conversation it started, when there was none. */
  started: Conversation | null;
  events: AsyncIterable<AssistantEvent>;
}

/** Checks the message, starts a conversation if needed, streams the answer. */
export class SendMessageUseCase {
  constructor(
    private readonly conversations: ConversationRepository,
    private readonly assistant: Assistant,
  ) {}

  /**
   * Throws `EmptyMessageError` or `MessageTooLongError` before anything is
   * created or sent.
   */
  async execute(
    content: string,
    { conversationId, model, signal }: SendMessageOptions = {},
  ): Promise<SendMessageResult> {
    const message = content.trim();
    if (!message) throw new EmptyMessageError();
    if (message.length > MESSAGE_MAX_LENGTH) throw new MessageTooLongError();

    const started = conversationId ? null : await this.conversations.start();
    const id = conversationId ?? started!.id;
    return {
      conversationId: id,
      started,
      events: this.assistant.stream({ conversationId: id, message, model, signal }),
    };
  }
}
