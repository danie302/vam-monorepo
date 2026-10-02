export type MessageRole = 'user' | 'assistant';

/** One message of the conversation. Plain data: no framework. */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

/** Long enough for a detailed question, short enough to keep prompts cheap. */
export const MESSAGE_MAX_LENGTH = 4000;

/** Creates a message with a fresh id; the content is trimmed. */
export function createMessage(
  role: MessageRole,
  content: string,
  now = new Date(),
): Message {
  return { id: crypto.randomUUID(), role, content: content.trim(), createdAt: now };
}
