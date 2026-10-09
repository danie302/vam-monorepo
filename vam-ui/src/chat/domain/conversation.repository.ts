import type { Conversation } from './conversation.ts';
import type { Message } from './message.ts';

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

/**
 * Port to where the user's conversations live (the API in the app, memory
 * with the placeholder assistant). Only ever sees the signed-in user's.
 */
export abstract class ConversationRepository {
  /** Most recently active first. */
  abstract list(): Promise<Conversation[]>;

  /** A new, untitled conversation. */
  abstract start(): Promise<Conversation>;

  /** Throws `ConversationNotFoundError` when it does not exist. */
  abstract get(id: string): Promise<ConversationWithMessages>;

  /** Throws `ConversationNotFoundError` when it does not exist. */
  abstract delete(id: string): Promise<void>;
}
