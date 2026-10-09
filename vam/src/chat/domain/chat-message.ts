export type ChatRole = 'user' | 'assistant';

export interface ChatMessageProps {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  /** The model that wrote it; `null` for the user's messages. */
  model: string | null;
  createdAt: Date;
}

/** One message of a conversation. Immutable once written. */
export class ChatMessage {
  private constructor(private readonly props: ChatMessageProps) {}

  static fromUser(conversationId: string, content: string, now = new Date()): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      conversationId,
      role: 'user',
      content,
      model: null,
      createdAt: now,
    });
  }

  static fromAssistant(
    conversationId: string,
    content: string,
    model: string,
    now = new Date(),
  ): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      conversationId,
      role: 'assistant',
      content,
      model,
      createdAt: now,
    });
  }

  static restore(props: ChatMessageProps): ChatMessage {
    return new ChatMessage({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get conversationId(): string {
    return this.props.conversationId;
  }

  get role(): ChatRole {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }

  get model(): string | null {
    return this.props.model;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toProps(): ChatMessageProps {
    return { ...this.props };
  }
}
