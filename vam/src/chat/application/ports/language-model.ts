import type { ChatRole } from '../../domain/chat-message.ts';

export interface LanguageModelMessage {
  role: ChatRole;
  content: string;
}

export interface LanguageModelRequest {
  model: string;
  /** System instructions: how the assistant behaves, above the messages. */
  instructions: string;
  /** The conversation so far, oldest first; the last one is the user's new message. */
  messages: LanguageModelMessage[];
  /** Aborted when the answer is no longer wanted (the client left). */
  signal?: AbortSignal;
}

/**
 * Port: a language model that answers a conversation as a stream of text
 * chunks. Adapters throw `LanguageModelUnavailableError` on failure.
 */
export abstract class LanguageModel {
  abstract stream(request: LanguageModelRequest): AsyncIterable<string>;
}
