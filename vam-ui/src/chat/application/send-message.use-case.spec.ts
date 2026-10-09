import { describe, expect, it } from 'vitest';
import { EmptyMessageError, MessageTooLongError } from '../domain/chat.errors.ts';
import { MESSAGE_MAX_LENGTH } from '../domain/message.ts';
import { InMemoryConversationRepository } from '../infrastructure/in-memory/in-memory-conversation.repository.ts';
import { PlaceholderAssistant } from '../infrastructure/placeholder/placeholder-assistant.ts';
import type { AssistantEvent } from './ports/assistant.ts';
import { SendMessageUseCase } from './send-message.use-case.ts';

async function collect(events: AsyncIterable<AssistantEvent>) {
  let text = '';
  const titles: (string | null)[] = [];
  for await (const event of events) {
    if (event.type === 'delta') text += event.text;
    else titles.push(event.conversation.title);
  }
  return { text, titles };
}

function setUp() {
  const conversations = new InMemoryConversationRepository();
  const useCase = new SendMessageUseCase(conversations, new PlaceholderAssistant(conversations, 0));
  return { conversations, useCase };
}

describe('SendMessageUseCase', () => {
  it('starts a conversation for a first message and streams the answer', async () => {
    const { conversations, useCase } = setUp();

    const result = await useCase.execute('  Plan my day  ');
    const { text, titles } = await collect(result.events);

    expect(result.started?.id).toBe(result.conversationId);
    expect(titles).toEqual(['Plan my day']);
    expect(text).toContain('Plan my day');
    const { messages } = await conversations.get(result.conversationId);
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('continues an existing conversation without starting another', async () => {
    const { conversations, useCase } = setUp();
    const first = await useCase.execute('First');
    await collect(first.events);

    const second = await useCase.execute('Second', { conversationId: first.conversationId });
    await collect(second.events);

    expect(second.started).toBeNull();
    expect(await conversations.list()).toHaveLength(1);
    expect((await conversations.get(first.conversationId)).messages).toHaveLength(4);
  });

  it('rejects empty and too long messages before starting anything', async () => {
    const { conversations, useCase } = setUp();

    await expect(useCase.execute('   ')).rejects.toBeInstanceOf(EmptyMessageError);
    await expect(useCase.execute('a'.repeat(MESSAGE_MAX_LENGTH + 1))).rejects.toBeInstanceOf(
      MessageTooLongError,
    );
    expect(await conversations.list()).toEqual([]);
  });
});
