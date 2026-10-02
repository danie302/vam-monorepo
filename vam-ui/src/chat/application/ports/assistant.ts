export interface AssistantModels {
  models: string[];
  default: string;
}

export interface AssistantRequest {
  message: string;
  /** One of `models()`; the assistant's default when missing. */
  model?: string;
  /** Abort to stop the answer (the user pressed stop). */
  signal?: AbortSignal;
}

/**
 * Port to whatever answers the user: the API's LLM, or a placeholder to
 * work without it. Gets one message, no history: conversation memory is a
 * later milestone.
 */
export abstract class Assistant {
  abstract models(): Promise<AssistantModels>;

  /**
   * The answer as text chunks, as they are generated. Throws
   * `AssistantUnavailableError` when the answer fails midway.
   */
  abstract stream(request: AssistantRequest): AsyncIterable<string>;
}
