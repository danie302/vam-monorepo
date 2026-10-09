import { ConversationRepository } from '../domain/conversation.repository.ts';
import type { ConversationWithMessages } from '../domain/conversation.repository.ts';
import type { Conversation } from '../domain/conversation.ts';

/** The user's conversations, most recently active first. */
export class ListConversationsUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  execute(): Promise<Conversation[]> {
    return this.conversations.list();
  }
}

/** A conversation with its messages; throws `ConversationNotFoundError`. */
export class GetConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  execute(id: string): Promise<ConversationWithMessages> {
    return this.conversations.get(id);
  }
}

/** Deletes a conversation and its messages; throws `ConversationNotFoundError`. */
export class DeleteConversationUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  execute(id: string): Promise<void> {
    return this.conversations.delete(id);
  }
}
