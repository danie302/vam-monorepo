import { ChatModels } from '../domain/chat-models.ts';
import { UnsupportedModelError } from '../domain/unsupported-model.error.ts';
import { FakeLanguageModel } from '../infrastructure/fake/fake-language-model.ts';
import { StreamReplyUseCase } from './stream-reply.use-case.ts';

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}

describe('StreamReplyUseCase', () => {
  const models = ChatModels.of(['small', 'large']);

  it('streams the answer of the chosen model', async () => {
    const languageModel = new FakeLanguageModel();
    languageModel.chunks = ['Hel', 'lo!'];
    const useCase = new StreamReplyUseCase(languageModel, models);

    const chunks = await collect(useCase.execute({ message: 'Hi', model: 'large' }));

    expect(chunks).toEqual(['Hel', 'lo!']);
    expect(languageModel.requests).toMatchObject([{ model: 'large', message: 'Hi' }]);
  });

  it('uses the default model when none is given', async () => {
    const languageModel = new FakeLanguageModel();

    await collect(new StreamReplyUseCase(languageModel, models).execute({ message: 'Hi' }));

    expect(languageModel.requests[0].model).toBe('small');
  });

  it('rejects a model that is not in the list before calling the model', () => {
    const languageModel = new FakeLanguageModel();
    const useCase = new StreamReplyUseCase(languageModel, models);

    expect(() => useCase.execute({ message: 'Hi', model: 'gpt-huge' })).toThrow(
      UnsupportedModelError,
    );
    expect(languageModel.requests).toEqual([]);
  });
});
