import { describe, expect, it } from 'vitest';
import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { MESSAGE_MAX_LENGTH } from '../domain/message.ts';
import { Assistant } from './ports/assistant.ts';
import { SendMessageUseCase } from './send-message.use-case.ts';

/** Answers with what it received, and remembers it. */
class EchoAssistant extends Assistant {
  received: string[] = [];

  async reply(message: string): Promise<string> {
    this.received.push(message);
    return `echo: ${message}`;
  }
}

describe('SendMessageUseCase', () => {
  it("returns the assistant's answer to the trimmed message", async () => {
    const assistant = new EchoAssistant();

    const answer = await new SendMessageUseCase(assistant).execute('  hello  ');

    expect(assistant.received).toEqual(['hello']);
    expect(answer).toMatchObject({ role: 'assistant', content: 'echo: hello' });
  });

  it('rejects an empty message without calling the assistant', async () => {
    const assistant = new EchoAssistant();

    await expect(new SendMessageUseCase(assistant).execute('   ')).rejects.toBeInstanceOf(
      EmptyMessageError,
    );
    expect(assistant.received).toEqual([]);
  });

  it('rejects a message over the length limit', async () => {
    await expect(
      new SendMessageUseCase(new EchoAssistant()).execute('a'.repeat(MESSAGE_MAX_LENGTH + 1)),
    ).rejects.toBeInstanceOf(MessageTooLongError);
  });
});
