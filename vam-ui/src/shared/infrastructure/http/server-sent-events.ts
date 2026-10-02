export interface ServerSentEvent {
  /** `message` when the event has no `event:` field, as in `EventSource`. */
  event: string;
  data: string;
}

/**
 * Reads a `text/event-stream` body event by event. `EventSource` cannot be
 * used for this: it only does GET, and our messages go in a POST body.
 * Follows the spec's line rules: `\n`, `\r\n` or `\r` endings, multi-line
 * `data`, `:` comments, and a blank line ending each event.
 */
export async function* readServerSentEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ServerSentEvent> {
  const reader = body.getReader();
  // stream: true keeps a multi-byte character split across chunks intact.
  const decoder = new TextDecoder();
  let buffer = '';
  let event = '';
  let data: string[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // A trailing `\r` may be half of a `\r\n`: wait for the next chunk.
      const complete = buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer;
      const lines = complete.split(/\r\n|\r|\n/);
      // The last piece may be half a line: keep it (and any held `\r`).
      buffer = (lines.pop() ?? '') + buffer.slice(complete.length);
      for (const line of lines) {
        if (line === '') {
          if (data.length > 0) yield { event: event || 'message', data: data.join('\n') };
          event = '';
          data = [];
          continue;
        }
        if (line.startsWith(':')) continue;
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? '' : line.slice(colon + 1);
        if (value.startsWith(' ')) value = value.slice(1);
        if (field === 'event') event = value;
        else if (field === 'data') data.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
