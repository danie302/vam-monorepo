import { ChatMessage } from './chat-message.ts';
import { Conversation } from './conversation.ts';

/**
 * Port: where conversations and their messages are stored. Reads take the
 * owner's id, so a user can never reach another user's conversation.
 */
export abstract class ConversationRepository {
  abstract create(conversation: Conversation): Promise<void>;

  /** Saves the changes of an existing conversation (title, updatedAt). */
  abstract update(conversation: Conversation): Promise<void>;

  /** The conversation if it exists and belongs to `userId`, or `null`. */
  abstract findForUser(id: string, userId: string): Promise<Conversation | null>;

  /** The user's conversations, most recently active first. */
  abstract listForUser(userId: string): Promise<Conversation[]>;

  /** Deletes the conversation and its messages; false when it is not the user's. */
  abstract deleteForUser(id: string, userId: string): Promise<boolean>;

  abstract addMessage(message: ChatMessage): Promise<void>;

  /** The conversation's messages, in the order they were added. */
  abstract listMessages(conversationId: string): Promise<ChatMessage[]>;
}
