import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { createMessage, MESSAGE_MAX_LENGTH, type Message } from '../domain/message.ts';
import { Assistant } from './ports/assistant.ts';

/** Checks the user's message and returns the assistant's answer. */
export class SendMessageUseCase {
  constructor(private readonly assistant: Assistant) {}

  /** Throws `EmptyMessageError` or `MessageTooLongError`. */
  async execute(content: string): Promise<Message> {
    const text = content.trim();
    if (!text) throw new EmptyMessageError();
    if (text.length > MESSAGE_MAX_LENGTH) throw new MessageTooLongError();
    return createMessage('assistant', await this.assistant.reply(text));
  }
}
