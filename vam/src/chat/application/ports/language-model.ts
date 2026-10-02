export interface LanguageModelRequest {
  model: string;
  message: string;
  /** Aborted when the answer is no longer wanted (the client left). */
  signal?: AbortSignal;
}

/**
 * Port: a language model that answers a message as a stream of text
 * chunks. Adapters throw `LanguageModelUnavailableError` on failure.
 */
export abstract class LanguageModel {
  abstract stream(request: LanguageModelRequest): AsyncIterable<string>;
}
