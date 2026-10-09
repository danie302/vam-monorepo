export interface ConversationProps {
  id: string;
  userId: string;
  /** `null` until the first message names it. */
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Longest title taken from a first message, in characters. */
export const TITLE_MAX_LENGTH = 60;

/**
 * A user's conversation with the assistant. Its messages are `ChatMessage`s
 * stored next to it. Plain TypeScript, immutable: changes return a copy.
 */
export class Conversation {
  private constructor(private readonly props: ConversationProps) {}

  /** A new, untitled conversation of `userId`. */
  static create(userId: string, now = new Date()): Conversation {
    return new Conversation({
      id: crypto.randomUUID(),
      userId,
      title: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds a conversation a repository loaded. */
  static restore(props: ConversationProps): Conversation {
    return new Conversation({ ...props });
  }

  /**
   * The title a first message gives: its first line, spaces collapsed,
   * cut at a word near `TITLE_MAX_LENGTH` with an ellipsis.
   */
  static titleFrom(message: string): string {
    const line = message.trim().split('\n')[0].replace(/\s+/g, ' ');
    if (line.length <= TITLE_MAX_LENGTH) return line;
    const cut = line.slice(0, TITLE_MAX_LENGTH - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return `${lastSpace > TITLE_MAX_LENGTH / 2 ? cut.slice(0, lastSpace) : cut}…`;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string | null {
    return this.props.title;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** After a message of the user: titled by it if still untitled, and touched. */
  withMessage(message: string, now = new Date()): Conversation {
    return new Conversation({
      ...this.props,
      title: this.props.title ?? Conversation.titleFrom(message),
      updatedAt: now,
    });
  }

  /** Marks the conversation as active now (it sorts first). */
  touched(now = new Date()): Conversation {
    return new Conversation({ ...this.props, updatedAt: now });
  }

  /** The conversation as plain data, for repositories to store. */
  toProps(): ConversationProps {
    return { ...this.props };
  }
}
