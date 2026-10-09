import { ApiClient, ApiError } from '../../../shared/infrastructure/http/api-client.ts';
import { ConversationNotFoundError } from '../../domain/chat.errors.ts';
import {
  ConversationRepository,
  type ConversationWithMessages,
} from '../../domain/conversation.repository.ts';
import type { Conversation } from '../../domain/conversation.ts';
import type { Message, MessageRole } from '../../domain/message.ts';

/** What `/conversations` returns: dates arrive as ISO strings. */
export interface ConversationResponse {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MessageResponse {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

/** `ConversationRepository` backed by the VAM API. */
export class HttpConversationRepository extends ConversationRepository {
  constructor(private readonly api: ApiClient) {
    super();
  }

  async list(): Promise<Conversation[]> {
    return (await this.api.get<ConversationResponse[]>('/conversations')).map(toConversation);
  }

  async start(): Promise<Conversation> {
    return toConversation(await this.api.post<ConversationResponse>('/conversations'));
  }

  async get(id: string): Promise<ConversationWithMessages> {
    const response = await notFoundAsDomainError(() =>
      this.api.get<ConversationResponse & { messages: MessageResponse[] }>(
        `/conversations/${encodeURIComponent(id)}`,
      ),
    );
    return { conversation: toConversation(response), messages: response.messages.map(toMessage) };
  }

  async delete(id: string): Promise<void> {
    await notFoundAsDomainError(() =>
      this.api.delete<void>(`/conversations/${encodeURIComponent(id)}`),
    );
  }
}

export function toConversation(response: ConversationResponse): Conversation {
  return {
    id: response.id,
    title: response.title,
    createdAt: new Date(response.createdAt),
    updatedAt: new Date(response.updatedAt),
  };
}

function toMessage(response: MessageResponse): Message {
  return {
    id: response.id,
    role: response.role,
    content: response.content,
    createdAt: new Date(response.createdAt),
  };
}

/** A 404, or a 400 for an id that is not even a UUID: the conversation is not there. */
export async function notFoundAsDomainError<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      throw new ConversationNotFoundError();
    }
    throw error;
  }
}
