import { Conversation } from '../domain/conversation.ts';
import { ConversationRepository } from '../domain/conversation.repository.ts';

/** Creates an empty, untitled conversation for the user. */
export class StartConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(userId: string): Promise<Conversation> {
    const conversation = Conversation.create(userId);
    await this.conversations.create(conversation);
    return conversation;
  }
}
