import { describe, expect, it } from 'vitest';
import type { Conversation } from '../domain/conversation.ts';
import { groupByActivity } from './conversation-groups.ts';

const at = (id: string, iso: string): Conversation => ({
  id,
  title: id,
  createdAt: new Date(iso),
  updatedAt: new Date(iso),
});

describe('groupByActivity', () => {
  it('groups by last activity, leaving out empty groups', () => {
    const now = new Date(2026, 9, 9, 15, 0);
    const groups = groupByActivity(
      [
        at('this-morning', new Date(2026, 9, 9, 8, 0).toISOString()),
        at('last-night', new Date(2026, 9, 8, 23, 0).toISOString()),
        at('last-week', new Date(2026, 9, 4, 12, 0).toISOString()),
        at('last-year', new Date(2025, 9, 1).toISOString()),
      ],
      now,
    );

    expect(groups.map((g) => [g.label, g.conversations.map((c) => c.id)])).toEqual([
      ['Today', ['this-morning']],
      ['Yesterday', ['last-night']],
      ['Previous 7 days', ['last-week']],
      ['Older', ['last-year']],
    ]);
  });
});
