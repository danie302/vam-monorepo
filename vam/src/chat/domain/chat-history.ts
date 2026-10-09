import { ChatMessage } from './chat-message.ts';

/**
 * How much of a conversation the model gets, in characters (~8k tokens).
 * Keeps long conversations within the model's context and the cost of each
 * message bounded; the oldest messages are left out first.
 */
export const HISTORY_MAX_CHARACTERS = 32_000;

/**
 * The newest messages that fit in `maxCharacters`, oldest first. The last
 * message (the user's new one) is always kept, even if it alone is longer.
 */
export function recentHistory(
  messages: readonly ChatMessage[],
  maxCharacters = HISTORY_MAX_CHARACTERS,
): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (kept.length > 0 && used + message.content.length > maxCharacters) break;
    kept.unshift(message);
    used += message.content.length;
  }
  return kept;
}
