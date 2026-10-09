import {
  Assistant,
  type AssistantEvent,
  type AssistantModels,
  type AssistantRequest,
} from '../../application/ports/assistant.ts';
import { createMessage } from '../../domain/message.ts';
import type { InMemoryConversationRepository } from '../in-memory/in-memory-conversation.repository.ts';

/**
 * Stand-in to work on the UI without the API or an OpenAI key: streams a
 * canned answer word by word and saves both messages in memory.
 */
export class PlaceholderAssistant extends Assistant {
  constructor(
    private readonly conversations: InMemoryConversationRepository,
    private readonly delayMs = 60,
  ) {
    super();
  }

  async models(): Promise<AssistantModels> {
    return { models: ['placeholder'], default: 'placeholder' };
  }

  async *stream({ conversationId, message, signal }: AssistantRequest): AsyncIterable<AssistantEvent> {
    const conversation = await this.conversations.addMessage(
      conversationId,
      createMessage('user', message),
    );
    yield { type: 'conversation', conversation };

    const answer = `I'm a placeholder, not a language model, but I got your message:\n\n> ${message}`;
    let text = '';
    try {
      await wait(this.delayMs * 8);
      for (const word of answer.split(/(?<=\s)/)) {
        if (signal?.aborted) return;
        text += word;
        yield { type: 'delta', text: word };
        await wait(this.delayMs);
      }
    } finally {
      if (text) await this.conversations.addMessage(conversationId, createMessage('assistant', text));
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
