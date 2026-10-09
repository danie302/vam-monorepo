import { ConversationNotFoundError } from '../../domain/chat.errors.ts';
import {
  ConversationRepository,
  type ConversationWithMessages,
} from '../../domain/conversation.repository.ts';
import { byRecentActivity, type Conversation } from '../../domain/conversation.ts';
import type { Message } from '../../domain/message.ts';

/**
 * `ConversationRepository` in memory (lost on reload), for tests and the
 * placeholder assistant, which writes the messages here.
 */
export class InMemoryConversationRepository extends ConversationRepository {
  private readonly conversations = new Map<string, ConversationWithMessages>();

  async list(): Promise<Conversation[]> {
    return [...this.conversations.values()].map((c) => c.conversation).sort(byRecentActivity);
  }

  async start(): Promise<Conversation> {
    const now = new Date();
    const conversation = { id: crypto.randomUUID(), title: null, createdAt: now, updatedAt: now };
    this.conversations.set(conversation.id, { conversation, messages: [] });
    return conversation;
  }

  async get(id: string): Promise<ConversationWithMessages> {
    const found = this.conversations.get(id);
    if (!found) throw new ConversationNotFoundError();
    return { conversation: found.conversation, messages: [...found.messages] };
  }

  async delete(id: string): Promise<void> {
    if (!this.conversations.delete(id)) throw new ConversationNotFoundError();
  }

  /** Adds a message; the first one titles the conversation. Returns it updated. */
  async addMessage(id: string, message: Message): Promise<Conversation> {
    const found = this.conversations.get(id);
    if (!found) throw new ConversationNotFoundError();
    found.messages.push(message);
    found.conversation = {
      ...found.conversation,
      title: found.conversation.title ?? message.content.split('\n')[0].slice(0, 60),
      updatedAt: message.createdAt,
    };
    return found.conversation;
  }
}
