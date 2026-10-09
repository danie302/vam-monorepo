import { Logger, type MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LanguageModelUnavailableError } from '../../application/language-model-unavailable.error.ts';

const logger = new Logger('ChatStream');

/**
 * The events of `POST /conversations/:id/messages`:
 *
 * - the `opening` events first (e.g. `conversation`, with its new title).
 * - `delta` `{ text }`: the next piece of the answer.
 * - `done` `{}`: the answer is complete.
 * - `error` `{ message }`: the answer stopped; `message` is safe to show.
 *
 * Errors become an `error` event rather than an Observable error so the
 * client always gets a message it can show, never internal details.
 */
export function toServerSentEvents(
  chunks: AsyncIterable<string>,
  opening: MessageEvent[] = [],
): Observable<MessageEvent> {
  return new Observable<MessageEvent>((subscriber) => {
    void (async () => {
      for (const event of opening) subscriber.next(event);
      try {
        for await (const text of chunks) {
          // The client left: the use case's signal stops the model too.
          // Returning ends the stream, which saves what arrived.
          if (subscriber.closed) return;
          subscriber.next({ type: 'delta', data: { text } });
        }
        subscriber.next({ type: 'done', data: {} });
      } catch (error) {
        if (!(error instanceof LanguageModelUnavailableError)) {
          logger.error(error);
        }
        subscriber.next({
          type: 'error',
          data: {
            message:
              error instanceof LanguageModelUnavailableError
                ? error.message
                : 'Something went wrong',
          },
        });
      }
      subscriber.complete();
    })();
  });
}
