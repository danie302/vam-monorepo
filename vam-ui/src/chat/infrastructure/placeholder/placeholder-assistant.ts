import {
  Assistant,
  type AssistantModels,
  type AssistantRequest,
} from '../../application/ports/assistant.ts';

/**
 * Stand-in to work on the UI without the API or an OpenAI key: streams a
 * canned answer word by word, like a real model would.
 */
export class PlaceholderAssistant extends Assistant {
  constructor(private readonly delayMs = 60) {
    super();
  }

  async models(): Promise<AssistantModels> {
    return { models: ['placeholder'], default: 'placeholder' };
  }

  async *stream({ message, signal }: AssistantRequest): AsyncIterable<string> {
    const answer = `I'm a placeholder, not a language model, but I got your message:\n\n"${message}"`;
    await wait(this.delayMs * 8);
    for (const word of answer.split(/(?<=\s)/)) {
      if (signal?.aborted) return;
      yield word;
      await wait(this.delayMs);
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
