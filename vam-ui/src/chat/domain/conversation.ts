/** A conversation of the signed-in user. Plain data: no framework. */
export interface Conversation {
  id: string;
  /** `null` until its first message names it (the API does). */
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** What to call a conversation that has no title yet. */
export function conversationTitle(conversation: Conversation): string {
  return conversation.title ?? 'New conversation';
}

/** Most recently active first, the order of the sidebar. */
export function byRecentActivity(a: Conversation, b: Conversation): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}
