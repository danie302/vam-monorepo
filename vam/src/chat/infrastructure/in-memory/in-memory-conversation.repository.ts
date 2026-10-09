import { ChatMessage } from '../../domain/chat-message.ts';
import { Conversation } from '../../domain/conversation.ts';
import { ConversationRepository } from '../../domain/conversation.repository.ts';

/** `ConversationRepository` in memory: for tests. */
export class InMemoryConversationRepository extends ConversationRepository {
  private readonly conversations = new Map<string, Conversation>();
  private messages: ChatMessage[] = [];

  async create(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async update(conversation: Conversation): Promise<void> {
    if (this.conversations.has(conversation.id)) {
      this.conversations.set(conversation.id, conversation);
    }
  }

  async findForUser(id: string, userId: string): Promise<Conversation | null> {
    const conversation = this.conversations.get(id);
    return conversation?.userId === userId ? conversation : null;
  }

  async listForUser(userId: string): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .filter((conversation) => conversation.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    if (!(await this.findForUser(id, userId))) return false;
    this.conversations.delete(id);
    this.messages = this.messages.filter((message) => message.conversationId !== id);
    return true;
  }

  async addMessage(message: ChatMessage): Promise<void> {
    this.messages.push(message);
  }

  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.messages.filter((message) => message.conversationId === conversationId);
  }
}
