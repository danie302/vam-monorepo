import { ChatInstructions } from '../domain/chat-instructions.ts';
import { ChatModels } from '../domain/chat-models.ts';
import { Conversation } from '../domain/conversation.ts';
import { ConversationNotFoundError } from '../domain/conversation-not-found.error.ts';
import { UnsupportedModelError } from '../domain/unsupported-model.error.ts';
import { FakeLanguageModel } from '../infrastructure/fake/fake-language-model.ts';
import { InMemoryConversationRepository } from '../infrastructure/in-memory/in-memory-conversation.repository.ts';
import { SendMessageUseCase } from './send-message.use-case.ts';

async function collect(stream: AsyncIterable<string>): Promise<string> {
  let text = '';
  for await (const chunk of stream) text += chunk;
  return text;
}

describe('SendMessageUseCase', () => {
  let conversations: InMemoryConversationRepository;
  let languageModel: FakeLanguageModel;
  let useCase: SendMessageUseCase;
  let conversation: Conversation;

  beforeEach(async () => {
    conversations = new InMemoryConversationRepository();
    languageModel = new FakeLanguageModel();
    useCase = new SendMessageUseCase(
      conversations,
      languageModel,
      ChatModels.of(['small', 'large']),
      ChatInstructions.of('Be brief.'),
    );
    conversation = Conversation.create('ada', new Date(1000));
    await conversations.create(conversation);
  });

  const roles = async () =>
    (await conversations.listMessages(conversation.id)).map((m) => [m.role, m.content, m.model]);

  it('saves the question, names the conversation, and saves the streamed answer', async () => {
    languageModel.chunks = ['Hel', 'lo!'];

    const result = await useCase.execute({
      userId: 'ada',
      conversationId: conversation.id,
      message: 'Hi there',
      model: 'large',
    });

    expect(result.conversation.title).toBe('Hi there');
    expect(await roles()).toEqual([['user', 'Hi there', null]]);
    expect(await collect(result.answer)).toBe('Hello!');
    expect(await roles()).toEqual([
      ['user', 'Hi there', null],
      ['assistant', 'Hello!', 'large'],
    ]);
    expect(languageModel.requests).toMatchObject([
      {
        model: 'large',
        instructions: 'Be brief.',
        messages: [{ role: 'user', content: 'Hi there' }],
      },
    ]);
    const [saved] = await conversations.listForUser('ada');
    expect(saved.title).toBe('Hi there');
    expect(saved.updatedAt.getTime()).toBeGreaterThan(1000);
  });

  it('keeps the first title on later messages, and uses the default model', async () => {
    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'First' })).answer);
    const second = await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Second' });

    expect(second.conversation.title).toBe('First');
    expect(languageModel.requests[0].model).toBe('small');
  });

  it('sends the conversation so far, ending with the new message', async () => {
    languageModel.chunks = ['Paris.'];
    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Capital of France?' })).answer);
    languageModel.chunks = ['About 2 million.'];

    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'And its population?' })).answer);

    expect(languageModel.requests[1].messages).toEqual([
      { role: 'user', content: 'Capital of France?' },
      { role: 'assistant', content: 'Paris.' },
      { role: 'user', content: 'And its population?' },
    ]);
  });

  it('leaves the oldest messages out of a long conversation', async () => {
    languageModel.chunks = ['ok'];
    const long = 'x'.repeat(20_000);
    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: long })).answer);
    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: long })).answer);

    await collect((await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Last' })).answer);

    // 20k + 2 + 20k + 2 + 4 is over the 32k budget: the first question is left out.
    expect(languageModel.requests[2].messages.map((m) => m.content.length)).toEqual([2, 20_000, 2, 4]);
  });

  it('saves what arrived when the answer fails midway', async () => {
    languageModel.chunks = ['Hel', 'lo'];
    languageModel.failAfter = 1;

    const { answer } = await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Hi' });

    await expect(collect(answer)).rejects.toThrow();
    expect(await roles()).toEqual([
      ['user', 'Hi', null],
      ['assistant', 'Hel', 'small'],
    ]);
  });

  it('saves what arrived when the reader stops early', async () => {
    languageModel.chunks = ['Hel', 'lo', '!'];
    const { answer } = await useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Hi' });

    for await (const chunk of answer) {
      expect(chunk).toBe('Hel');
      break;
    }

    expect((await roles()).at(-1)).toEqual(['assistant', 'Hel', 'small']);
  });

  it("refuses someone else's conversation before saving anything", async () => {
    await expect(
      useCase.execute({ userId: 'bob', conversationId: conversation.id, message: 'Hi' }),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
    expect(await roles()).toEqual([]);
  });

  it('refuses a model outside the list before saving anything', async () => {
    await expect(
      useCase.execute({ userId: 'ada', conversationId: conversation.id, message: 'Hi', model: 'huge' }),
    ).rejects.toBeInstanceOf(UnsupportedModelError);
    expect(await roles()).toEqual([]);
    expect(languageModel.requests).toEqual([]);
  });
});
