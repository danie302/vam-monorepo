import { ChatMessage, type ChatRole } from '../../domain/chat-message.ts';
import { Conversation } from '../../domain/conversation.ts';

/** What the API shows of a conversation: never its owner. */
export interface ConversationResponse {
  id: string;
  /** `null` until the first message names it. */
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageResponse {
  id: string;
  role: ChatRole;
  content: string;
  model: string | null;
  createdAt: Date;
}

export interface ConversationWithMessagesResponse extends ConversationResponse {
  messages: ChatMessageResponse[];
}

export function toConversationResponse(conversation: Conversation): ConversationResponse {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export function toChatMessageResponse(message: ChatMessage): ChatMessageResponse {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    model: message.model,
    createdAt: message.createdAt,
  };
}
