import { ChatMessage } from '../domain/chat-message.ts';
import { Conversation } from '../domain/conversation.ts';
import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: ChatMessage[];
}

/** One of the user's conversations with its messages. */
export class GetConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  /** Throws `ConversationNotFoundError` when it is missing or not the user's. */
  async execute(userId: string, conversationId: string): Promise<ConversationWithMessages> {
    const conversation = await this.conversations.findForUser(conversationId, userId);
    if (!conversation) throw new ConversationNotFoundError(conversationId);
    return { conversation, messages: await this.conversations.listMessages(conversationId) };
  }
}
