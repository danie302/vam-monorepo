import type { Conversation } from '../../domain/conversation.ts';

export interface AssistantModels {
  models: string[];
  default: string;
}

export interface AssistantRequest {
  conversationId: string;
  message: string;
  /** One of `models()`; the assistant's default when missing. */
  model?: string;
  /** Abort to stop the answer (the user pressed stop). */
  signal?: AbortSignal;
}

/**
 * What the answer stream carries: first the conversation as the message
 * left it (new title, activity date), then the answer's text, chunk by chunk.
 */
export type AssistantEvent =
  | { type: 'conversation'; conversation: Conversation }
  | { type: 'delta'; text: string };

/**
 * Port to whatever answers the user: the API's LLM, or a placeholder to
 * work without it. The message and the answer are saved in the conversation.
 */
export abstract class Assistant {
  abstract models(): Promise<AssistantModels>;

  /**
   * Throws `ConversationNotFoundError` before the first event when the
   * conversation is gone, and `AssistantUnavailableError` when the answer
   * fails midway.
   */
  abstract stream(request: AssistantRequest): AsyncIterable<AssistantEvent>;
}
