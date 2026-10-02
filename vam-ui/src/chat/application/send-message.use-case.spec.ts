import { describe, expect, it } from 'vitest';
import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { MESSAGE_MAX_LENGTH } from '../domain/message.ts';
import { Assistant, type AssistantRequest } from './ports/assistant.ts';
import { SendMessageUseCase } from './send-message.use-case.ts';

/** Answers with what it received, word by word, and remembers the requests. */
class EchoAssistant extends Assistant {
  requests: AssistantRequest[] = [];

  async models() {
    return { models: ['echo'], default: 'echo' };
  }

  async *stream(request: AssistantRequest) {
    this.requests.push(request);
    yield* `echo: ${request.message}`.split(/(?<= )/);
  }
}

async function collect(stream: AsyncIterable<string>): Promise<string> {
  let text = '';
  for await (const chunk of stream) text += chunk;
  return text;
}

describe('SendMessageUseCase', () => {
  it('streams the answer to the trimmed message with the chosen model', async () => {
    const assistant = new EchoAssistant();

    const answer = await collect(
      new SendMessageUseCase(assistant).execute('  hello there ', { model: 'echo' }),
    );

    expect(answer).toBe('echo: hello there');
    expect(assistant.requests).toMatchObject([{ message: 'hello there', model: 'echo' }]);
  });

  it('rejects an empty message before calling the assistant', () => {
    const assistant = new EchoAssistant();

    expect(() => new SendMessageUseCase(assistant).execute('   ')).toThrow(EmptyMessageError);
    expect(assistant.requests).toEqual([]);
  });

  it('rejects a message over the length limit', () => {
    expect(() =>
      new SendMessageUseCase(new EchoAssistant()).execute('a'.repeat(MESSAGE_MAX_LENGTH + 1)),
    ).toThrow(MessageTooLongError);
  });
});
