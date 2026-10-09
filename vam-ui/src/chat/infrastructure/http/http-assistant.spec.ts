import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../../shared/infrastructure/http/api-client.ts';
import type { AssistantEvent } from '../../application/ports/assistant.ts';
import { AssistantUnavailableError, ConversationNotFoundError } from '../../domain/chat.errors.ts';
import { HttpAssistant } from './http-assistant.ts';

/** Makes `fetch` answer with this event-stream body (or a JSON error). */
function respondWith(body: string, status = 200) {
  const fetch = vi.fn(async () =>
    new Response(body, {
      status,
      headers: { 'Content-Type': status === 200 ? 'text/event-stream' : 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

async function collect(events: AsyncIterable<AssistantEvent>): Promise<AssistantEvent[]> {
  const all: AssistantEvent[] = [];
  for await (const event of events) all.push(event);
  return all;
}

const assistant = new HttpAssistant(new ApiClient('http://api.test'));
const conversation =
  '{"id":"c1","title":"Hi","createdAt":"2026-10-09T10:00:00.000Z","updatedAt":"2026-10-09T10:05:00.000Z"}';

describe('HttpAssistant', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts to the conversation and yields the conversation, then the deltas', async () => {
    const fetch = respondWith(
      `event: conversation\ndata: ${conversation}\n\n` +
        'event: delta\ndata: {"text":"Hel"}\n\nevent: delta\ndata: {"text":"lo"}\n\nevent: done\ndata: {}\n\n',
    );

    const events = await collect(assistant.stream({ conversationId: 'c1', message: 'Hi', model: 'm' }));

    expect(events).toEqual([
      {
        type: 'conversation',
        conversation: {
          id: 'c1',
          title: 'Hi',
          createdAt: new Date('2026-10-09T10:00:00.000Z'),
          updatedAt: new Date('2026-10-09T10:05:00.000Z'),
        },
      },
      { type: 'delta', text: 'Hel' },
      { type: 'delta', text: 'lo' },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/conversations/c1/messages',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ message: 'Hi', model: 'm' }),
      }),
    );
  });

  it('throws the message of an error event', async () => {
    respondWith('event: delta\ndata: {"text":"Hel"}\n\nevent: error\ndata: {"message":"Busy"}\n\n');

    await expect(collect(assistant.stream({ conversationId: 'c1', message: 'Hi' }))).rejects.toEqual(
      new AssistantUnavailableError('Busy'),
    );
  });

  it("reads Nest's plain-text error events too", async () => {
    respondWith('event: error\nid: 1\ndata: Conversation not found\n\n');

    await expect(collect(assistant.stream({ conversationId: 'c1', message: 'Hi' }))).rejects.toEqual(
      new AssistantUnavailableError('Conversation not found'),
    );
  });

  it('treats a stream that ends without done as cut off', async () => {
    respondWith('event: delta\ndata: {"text":"Hel"}\n\n');

    await expect(collect(assistant.stream({ conversationId: 'c1', message: 'Hi' }))).rejects.toThrow(
      'The answer was cut off',
    );
  });

  it('turns a 404 into ConversationNotFoundError', async () => {
    respondWith(JSON.stringify({ message: 'Conversation not found' }), 404);

    await expect(
      collect(assistant.stream({ conversationId: 'gone', message: 'Hi' })),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
  });
});
