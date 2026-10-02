import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { MESSAGE_MAX_LENGTH } from '../domain/message.ts';
import { Assistant } from './ports/assistant.ts';

export interface SendMessageOptions {
  model?: string;
  signal?: AbortSignal;
}

/** Checks the user's message and streams the assistant's answer. */
export class SendMessageUseCase {
  constructor(private readonly assistant: Assistant) {}

  /**
   * Throws `EmptyMessageError` or `MessageTooLongError` right away, before
   * anything is sent; then returns the answer chunk by chunk.
   */
  execute(content: string, { model, signal }: SendMessageOptions = {}): AsyncIterable<string> {
    const message = content.trim();
    if (!message) throw new EmptyMessageError();
    if (message.length > MESSAGE_MAX_LENGTH) throw new MessageTooLongError();
    return this.assistant.stream({ message, model, signal });
  }
}
