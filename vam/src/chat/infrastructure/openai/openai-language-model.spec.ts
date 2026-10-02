import OpenAI from 'openai';
import { LanguageModelUnavailableError } from '../../application/language-model-unavailable.error.ts';
import { OpenAiLanguageModel } from './openai-language-model.ts';

/** An `OpenAI` client whose `responses.create` streams `events` or throws. */
function fakeClient(result: { events?: object[]; error?: unknown }) {
  const create = vi.fn(async () => {
    if (result.error) throw result.error;
    return (async function* () {
      yield* result.events ?? [];
    })();
  });
  return { client: { responses: { create } } as unknown as OpenAI, create };
}

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}

describe('OpenAiLanguageModel', () => {
  beforeEach(() => {
    // The adapter logs failures; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });
  afterEach(() => vi.restoreAllMocks());

  it('yields the text deltas and asks OpenAI not to store the response', async () => {
    const { client, create } = fakeClient({
      events: [
        { type: 'response.created' },
        { type: 'response.output_text.delta', delta: 'Hel' },
        { type: 'response.output_text.delta', delta: 'lo' },
        { type: 'response.completed' },
      ],
    });
    const signal = new AbortController().signal;

    const chunks = await collect(
      new OpenAiLanguageModel(client).stream({ model: 'm', message: 'Hi', signal }),
    );

    expect(chunks).toEqual(['Hel', 'lo']);
    expect(create).toHaveBeenCalledWith(
      { model: 'm', input: 'Hi', stream: true, store: false },
      { signal },
    );
  });

  it('turns an error event into LanguageModelUnavailableError', async () => {
    const { client } = fakeClient({
      events: [
        { type: 'response.output_text.delta', delta: 'Hel' },
        { type: 'error', code: 'server_error', message: 'boom', param: null },
      ],
    });

    await expect(
      collect(new OpenAiLanguageModel(client).stream({ model: 'm', message: 'Hi' })),
    ).rejects.toBeInstanceOf(LanguageModelUnavailableError);
  });

  it.each([
    [401, 'The assistant is not configured correctly'],
    [429, 'The assistant is busy, try again in a moment'],
    [500, 'The assistant is not available right now'],
  ])('maps an HTTP %i from OpenAI to a message for the user', async (status, message) => {
    const { client } = fakeClient({
      error: OpenAI.APIError.generate(status, { message: 'raw' }, 'raw', new Headers()),
    });

    await expect(
      collect(new OpenAiLanguageModel(client).stream({ model: 'm', message: 'Hi' })),
    ).rejects.toThrow(message);
  });

  it('stops quietly when the request was aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const { client } = fakeClient({ error: new OpenAI.APIUserAbortError() });

    const chunks = await collect(
      new OpenAiLanguageModel(client).stream({
        model: 'm',
        message: 'Hi',
        signal: controller.signal,
      }),
    );

    expect(chunks).toEqual([]);
  });
});
