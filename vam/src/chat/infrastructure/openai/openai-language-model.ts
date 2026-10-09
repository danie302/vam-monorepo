import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { LanguageModelUnavailableError } from '../../application/language-model-unavailable.error.ts';
import {
  LanguageModel,
  type LanguageModelRequest,
} from '../../application/ports/language-model.ts';

/**
 * `LanguageModel` on OpenAI's Responses API, streamed. OpenAI errors become
 * `LanguageModelUnavailableError` with a message fit for the user; the
 * details go to the log.
 */
export class OpenAiLanguageModel extends LanguageModel {
  private readonly logger = new Logger(OpenAiLanguageModel.name);

  constructor(private readonly client: OpenAI) {
    super();
  }

  async *stream({
    model,
    instructions,
    messages,
    signal,
  }: LanguageModelRequest): AsyncIterable<string> {
    try {
      const events = await this.client.responses.create(
        {
          model,
          // System instructions: above the messages, and not part of the history.
          instructions,
          // The whole conversation every time: the API keeps no state for us
          // (store: false — otherwise OpenAI keeps responses for 30 days).
          input: messages.map(({ role, content }) => ({ role, content })),
          stream: true,
          store: false,
        },
        { signal },
      );
      for await (const event of events) {
        if (event.type === 'response.output_text.delta') {
          yield event.delta;
        } else if (event.type === 'error') {
          throw new LanguageModelUnavailableError(undefined, { cause: event });
        } else if (event.type === 'response.failed') {
          throw new LanguageModelUnavailableError(undefined, { cause: event.response.error });
        }
      }
    } catch (error) {
      // The client left: nobody is reading, so just stop.
      if (signal?.aborted || error instanceof OpenAI.APIUserAbortError) return;
      const unavailable = toUnavailable(error);
      this.logger.error(
        `OpenAI request failed (model ${model}): ${describe(unavailable.cause ?? error)}`,
      );
      throw unavailable;
    }
  }
}

/** What to tell the user about each kind of OpenAI failure. */
function toUnavailable(error: unknown): LanguageModelUnavailableError {
  if (error instanceof LanguageModelUnavailableError) return error;
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401 || error.status === 403) {
      return new LanguageModelUnavailableError(
        'The assistant is not configured correctly',
        { cause: error },
      );
    }
    if (error.status === 429) {
      return new LanguageModelUnavailableError(
        'The assistant is busy, try again in a moment',
        { cause: error },
      );
    }
    if (error.status === 404) {
      return new LanguageModelUnavailableError(
        'This model is not available right now',
        { cause: error },
      );
    }
  }
  return new LanguageModelUnavailableError(undefined, { cause: error });
}

function describe(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  return JSON.stringify(cause);
}
