import { describe, expect, it } from 'vitest';
import { readServerSentEvents, type ServerSentEvent } from './server-sent-events.ts';

/** A body that arrives in exactly these pieces. */
function body(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<ServerSentEvent[]> {
  const events: ServerSentEvent[] = [];
  for await (const event of readServerSentEvents(stream)) events.push(event);
  return events;
}

describe('readServerSentEvents', () => {
  it('reads named events with their data', async () => {
    const events = await collect(
      body('event: delta\nid: 1\ndata: {"text":"Hi"}\n\nevent: done\ndata: {}\n\n'),
    );

    expect(events).toEqual([
      { event: 'delta', data: '{"text":"Hi"}' },
      { event: 'done', data: '{}' },
    ]);
  });

  it('joins events split across chunks, even mid-line and mid-CRLF', async () => {
    const events = await collect(
      body('event: del', 'ta\r', '\ndata: {"text":', '"Hi"}\r\n\r', '\n'),
    );

    expect(events).toEqual([{ event: 'delta', data: '{"text":"Hi"}' }]);
  });

  it('keeps a multi-byte character split across chunks', async () => {
    const bytes = new TextEncoder().encode('data: ñ\n\n');
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // 'ñ' is two bytes: split it between the chunks.
        controller.enqueue(bytes.slice(0, 7));
        controller.enqueue(bytes.slice(7));
        controller.close();
      },
    });

    expect(await collect(stream)).toEqual([{ event: 'message', data: 'ñ' }]);
  });

  it('joins multi-line data, skips comments, defaults the event name', async () => {
    const events = await collect(body(': keep-alive\n\ndata: a\ndata: b\n\n'));

    expect(events).toEqual([{ event: 'message', data: 'a\nb' }]);
  });
});
