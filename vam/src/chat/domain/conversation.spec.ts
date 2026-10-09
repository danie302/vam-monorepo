import { Conversation, TITLE_MAX_LENGTH } from './conversation.ts';

describe('Conversation', () => {
  it('is untitled until its first message names it', () => {
    const conversation = Conversation.create('user-1', new Date(1000));
    expect(conversation.title).toBeNull();

    const later = new Date(2000);
    const named = conversation.withMessage('  Plan my\n trip to Lisbon  ', later);

    expect(named.title).toBe('Plan my');
    expect(named.updatedAt).toEqual(later);
    expect(named.withMessage('Something else').title).toBe('Plan my');
  });

  it('collapses spaces in the title', () => {
    expect(Conversation.titleFrom('What   is\tthe weather?')).toBe('What is the weather?');
  });

  it('cuts long titles at a word, with an ellipsis', () => {
    const title = Conversation.titleFrom(
      'Could you help me write a long email to my landlord about the broken heating in the flat',
    );

    expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
    expect(title).toBe('Could you help me write a long email to my landlord about…');
  });

  it('cuts a long word-less title mid-word', () => {
    expect(Conversation.titleFrom('a'.repeat(100))).toBe(`${'a'.repeat(TITLE_MAX_LENGTH - 1)}…`);
  });
});
