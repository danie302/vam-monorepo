import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiError } from '../../../shared/infrastructure/http/api-client.ts';
import { AssistantUnavailableError } from '../../domain/chat.errors.ts';
import { HttpAssistant } from './http-assistant.ts';

/** Makes `fetch` answer with this event-stream body (or JSON error). */
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

async function collect(stream: AsyncIterable<string>): Promise<string> {
  let text = '';
  for await (const chunk of stream) text += chunk;
  return text;
}

const assistant = new HttpAssistant(new ApiClient('http://api.test'));

describe('HttpAssistant', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the message with credentials and yields the deltas', async () => {
    const fetch = respondWith(
      'event: delta\ndata: {"text":"Hel"}\n\nevent: delta\ndata: {"text":"lo"}\n\nevent: done\ndata: {}\n\n',
    );

    const text = await collect(assistant.stream({ message: 'Hi', model: 'm' }));

    expect(text).toBe('Hello');
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/chat/messages',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ message: 'Hi', model: 'm' }),
      }),
    );
  });

  it('throws the message of an error event', async () => {
    respondWith('event: delta\ndata: {"text":"Hel"}\n\nevent: error\ndata: {"message":"Busy"}\n\n');

    await expect(collect(assistant.stream({ message: 'Hi' }))).rejects.toEqual(
      new AssistantUnavailableError('Busy'),
    );
  });

  it('treats a stream that ends without done as cut off', async () => {
    respondWith('event: delta\ndata: {"text":"Hel"}\n\n');

    await expect(collect(assistant.stream({ message: 'Hi' }))).rejects.toThrow(
      'The answer was cut off',
    );
  });

  it('throws an ApiError with the API message on a 400', async () => {
    respondWith(JSON.stringify({ message: 'Model "x" is not available' }), 400);

    await expect(collect(assistant.stream({ message: 'Hi', model: 'x' }))).rejects.toEqual(
      new ApiError(400, 'Model "x" is not available'),
    );
  });
});
