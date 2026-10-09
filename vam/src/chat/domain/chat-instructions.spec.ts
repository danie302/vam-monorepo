import { ChatInstructions, DEFAULT_CHAT_INSTRUCTIONS } from './chat-instructions.ts';

describe('ChatInstructions', () => {
  it('uses the given text, trimmed', () => {
    expect(ChatInstructions.of('  Only talk about cooking.  ').text).toBe('Only talk about cooking.');
  });

  it.each([undefined, '', '   \n'])('falls back to the default for %j', (text) => {
    expect(ChatInstructions.of(text).text).toBe(DEFAULT_CHAT_INSTRUCTIONS);
  });
});
