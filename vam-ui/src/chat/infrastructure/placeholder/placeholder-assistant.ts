import { Assistant } from '../../application/ports/assistant.ts';

/**
 * Stand-in until the API has an LLM endpoint: waits a moment, like a real
 * model would, and says it is not connected yet.
 */
export class PlaceholderAssistant extends Assistant {
  constructor(private readonly delayMs = 800) {
    super();
  }

  async reply(message: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    return `I'm not connected to a language model yet, but I got your message:\n\n"${message}"`;
  }
}
