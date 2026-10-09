import { Conversation } from '../domain/conversation.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

/** The user's conversations, most recently active first. */
export class ListConversationsUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  execute(userId: string): Promise<Conversation[]> {
    return this.conversations.listForUser(userId);
  }
}
