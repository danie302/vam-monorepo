import { recentHistory } from './chat-history.ts';
import { ChatMessage } from './chat-message.ts';

const user = (content: string) => ChatMessage.fromUser('c1', content);
const assistant = (content: string) => ChatMessage.fromAssistant('c1', content, 'm');

describe('recentHistory', () => {
  it('keeps the whole conversation when it fits', () => {
    const messages = [user('Hi'), assistant('Hello!'), user('How are you?')];

    expect(recentHistory(messages, 100)).toEqual(messages);
  });

  it('leaves out the oldest messages first', () => {
    const messages = [user('a'.repeat(10)), assistant('b'.repeat(10)), user('c'.repeat(10))];

    expect(recentHistory(messages, 25).map((m) => m.content[0])).toEqual(['b', 'c']);
  });

  it('always keeps the newest message, even over the limit', () => {
    const messages = [user('short'), user('x'.repeat(50))];

    expect(recentHistory(messages, 10).map((m) => m.content.length)).toEqual([50]);
  });

  it('stops at the first message that does not fit (no gaps)', () => {
    const messages = [user('a'), assistant('b'.repeat(20)), user('c')];

    expect(recentHistory(messages, 10).map((m) => m.content[0])).toEqual(['c']);
  });
});
