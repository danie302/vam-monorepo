import { ChatModels } from '../domain/chat-models.ts';
import { UnsupportedModelError } from '../domain/unsupported-model.error.ts';
import { LanguageModel } from './ports/language-model.ts';

export interface StreamReplyCommand {
  message: string;
  /** One of the chat models; the default one when missing. */
  model?: string;
  signal?: AbortSignal;
}

/**
 * Answers one message with the language model, chunk by chunk. No history:
 * conversation memory is a later milestone.
 */
export class StreamReplyUseCase {
  constructor(
    private readonly languageModel: LanguageModel,
    private readonly models: ChatModels,
  ) {}

  /**
   * Checks the model right away (throws `UnsupportedModelError` before any
   * chunk), then returns the stream, which may throw
   * `LanguageModelUnavailableError` while it is read.
   */
  execute({ message, model, signal }: StreamReplyCommand): AsyncIterable<string> {
    const chosen = model ?? this.models.default;
    if (!this.models.supports(chosen)) throw new UnsupportedModelError(chosen);
    return this.languageModel.stream({ model: chosen, message, signal });
  }
}
