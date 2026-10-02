import { LanguageModelUnavailableError } from '../../application/language-model-unavailable.error.ts';
import {
  LanguageModel,
  type LanguageModelRequest,
} from '../../application/ports/language-model.ts';

/**
 * `LanguageModel` for tests: answers `chunks` (or echoes the message word
 * by word), remembers the requests, and fails after `failAfter` chunks.
 */
export class FakeLanguageModel extends LanguageModel {
  requests: LanguageModelRequest[] = [];
  chunks?: string[];
  failAfter?: number;

  async *stream(request: LanguageModelRequest): AsyncIterable<string> {
    this.requests.push(request);
    const chunks = this.chunks ?? request.message.split(/(?<= )/);
    for (const [i, chunk] of chunks.entries()) {
      if (i === this.failAfter) throw new LanguageModelUnavailableError();
      yield chunk;
    }
  }
}
