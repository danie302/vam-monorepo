import type { Conversation } from '../domain/conversation.ts';

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Splits conversations (already most recent first) by when they were last
 * active: Today, Yesterday, Previous 7 days, Previous 30 days, Older.
 * Empty groups are left out.
 */
export function groupByActivity(
  conversations: Conversation[],
  now = new Date(),
): ConversationGroup[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups: ConversationGroup[] = [
    { label: 'Today', conversations: [] },
    { label: 'Yesterday', conversations: [] },
    { label: 'Previous 7 days', conversations: [] },
    { label: 'Previous 30 days', conversations: [] },
    { label: 'Older', conversations: [] },
  ];
  for (const conversation of conversations) {
    const at = conversation.updatedAt.getTime();
    const index =
      at >= today ? 0 : at >= today - DAY ? 1 : at >= today - 7 * DAY ? 2 : at >= today - 30 * DAY ? 3 : 4;
    groups[index].conversations.push(conversation);
  }
  return groups.filter((group) => group.conversations.length > 0);
}
