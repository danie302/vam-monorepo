import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

/** Checks that the conversation exists and belongs to the user. */
export class CheckConversationAccessUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  /** Throws `ConversationNotFoundError` when it is missing or not the user's. */
  async execute(userId: string, conversationId: string): Promise<void> {
    if (!(await this.conversations.findForUser(conversationId, userId))) {
      throw new ConversationNotFoundError(conversationId);
    }
  }
}
