import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

/** Deletes one of the user's conversations and its messages. */
export class DeleteConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  /** Throws `ConversationNotFoundError` when it is missing or not the user's. */
  async execute(userId: string, conversationId: string): Promise<void> {
    if (!(await this.conversations.deleteForUser(conversationId, userId))) {
      throw new ConversationNotFoundError(conversationId);
    }
  }
}
