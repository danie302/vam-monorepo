import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import request from 'supertest';
import { AppModule } from './../src/app.module.ts';
import { LanguageModel } from '../src/chat/application/ports/language-model.ts';
import { DEFAULT_CHAT_INSTRUCTIONS } from '../src/chat/domain/chat-instructions.ts';
import { FakeLanguageModel } from '../src/chat/infrastructure/fake/fake-language-model.ts';

/** Parses a `text/event-stream` body into `{ event, data }` pairs. */
function parseEvents(body: string): { event: string; data: any }[] {
  return body
    .split('\n\n')
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split('\n');
      const field = (name: string) =>
        lines
          .filter((line) => line.startsWith(`${name}: `))
          .map((line) => line.slice(name.length + 2))
          .join('\n');
      return { event: field('event'), data: JSON.parse(field('data')) };
    });
}

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let languageModel: FakeLanguageModel;
  let ada: string;
  let bob: string;

  const signUp = async (name: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email: `${name}@example.com`, name, password: 'hunter22' })
      .expect(201);
    return response.get('Set-Cookie')![0].split(';')[0];
  };

  const startConversation = async (cookie = ada): Promise<string> =>
    (await request(app.getHttpServer()).post('/conversations').set('Cookie', cookie).expect(201))
      .body.id;

  const send = (id: string, body: object, cookie = ada) =>
    request(app.getHttpServer())
      .post(`/conversations/${id}/messages`)
      .set('Cookie', cookie)
      .send(body);

  beforeEach(async () => {
    languageModel = new FakeLanguageModel();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ logN: 10 }))
      .overrideProvider(LanguageModel)
      .useValue(languageModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    ada = await signUp('ada');
    bob = await signUp('bob');
  });

  afterEach(async () => {
    await app.close();
  });

  it('streams the answer: conversation, deltas, done; and saves both messages', async () => {
    languageModel.chunks = ['Hello', ', Ada', '!'];
    const id = await startConversation();

    const response = await send(id, { message: 'Hi there', model: 'gpt-5.4-nano' })
      .expect(200)
      .expect('Content-Type', /text\/event-stream/);

    const events = parseEvents(response.text);
    expect(events[0]).toMatchObject({
      event: 'conversation',
      data: { id, title: 'Hi there' },
    });
    expect(events.slice(1)).toEqual([
      { event: 'delta', data: { text: 'Hello' } },
      { event: 'delta', data: { text: ', Ada' } },
      { event: 'delta', data: { text: '!' } },
      { event: 'done', data: {} },
    ]);

    const conversation = await request(app.getHttpServer())
      .get(`/conversations/${id}`)
      .set('Cookie', ada)
      .expect(200);
    expect(conversation.body).toMatchObject({ id, title: 'Hi there' });
    expect(conversation.body).not.toHaveProperty('userId');
    expect(
      conversation.body.messages.map((m: any) => [m.role, m.content, m.model]),
    ).toEqual([
      ['user', 'Hi there', null],
      ['assistant', 'Hello, Ada!', 'gpt-5.4-nano'],
    ]);
  });

  it('sends the conversation history to the model with each new message', async () => {
    const id = await startConversation();
    languageModel.chunks = ['Nice to meet you, Ada.'];
    await send(id, { message: 'My name is Ada' }).expect(200);
    languageModel.chunks = ['Your name is Ada.'];

    await send(id, { message: 'What is my name?' }).expect(200);

    expect(languageModel.requests[1].messages).toEqual([
      { role: 'user', content: 'My name is Ada' },
      { role: 'assistant', content: 'Nice to meet you, Ada.' },
      { role: 'user', content: 'What is my name?' },
    ]);
  });

  it('gives the model the default instructions when CHAT_INSTRUCTIONS is not set', async () => {
    const id = await startConversation();

    await send(id, { message: 'Hi' }).expect(200);

    expect(languageModel.requests[0].instructions).toBe(DEFAULT_CHAT_INSTRUCTIONS);
  });

  it("does not mix the history of different conversations", async () => {
    const first = await startConversation();
    const second = await startConversation();
    await send(first, { message: 'Secret: 42' }).expect(200);

    await send(second, { message: 'Hi' }).expect(200);

    expect(languageModel.requests[1].messages).toEqual([{ role: 'user', content: 'Hi' }]);
  });

  it("lists the user's conversations, most recently active first", async () => {
    const first = await startConversation();
    const second = await startConversation();
    await startConversation(bob);
    await send(first, { message: 'Back to the first one' }).expect(200);

    const list = await request(app.getHttpServer())
      .get('/conversations')
      .set('Cookie', ada)
      .expect(200);

    expect(list.body.map((c: any) => [c.id, c.title])).toEqual([
      [first, 'Back to the first one'],
      [second, null],
    ]);
  });

  it('keeps what arrived when the model fails midway, and ends with an error event', async () => {
    languageModel.chunks = ['Hel', 'lo'];
    languageModel.failAfter = 1;
    const id = await startConversation();

    const response = await send(id, { message: 'Hi' }).expect(200);

    expect(parseEvents(response.text).slice(1)).toEqual([
      { event: 'delta', data: { text: 'Hel' } },
      { event: 'error', data: { message: 'The assistant is not available right now' } },
    ]);
    const conversation = await request(app.getHttpServer())
      .get(`/conversations/${id}`)
      .set('Cookie', ada);
    expect(conversation.body.messages.map((m: any) => m.content)).toEqual(['Hi', 'Hel']);
  });

  it('deletes a conversation', async () => {
    const id = await startConversation();
    await send(id, { message: 'Hi' }).expect(200);

    await request(app.getHttpServer()).delete(`/conversations/${id}`).set('Cookie', ada).expect(204);

    await request(app.getHttpServer()).get(`/conversations/${id}`).set('Cookie', ada).expect(404);
    const list = await request(app.getHttpServer()).get('/conversations').set('Cookie', ada);
    expect(list.body).toEqual([]);
  });

  it("treats another user's conversation as missing", async () => {
    const id = await startConversation();
    const server = app.getHttpServer();

    await request(server).get(`/conversations/${id}`).set('Cookie', bob).expect(404);
    await request(server).delete(`/conversations/${id}`).set('Cookie', bob).expect(404);
    const response = await send(id, { message: 'Hi' }, bob).expect(404);

    expect(response.body.message).toBe('Conversation not found');
    expect(languageModel.requests).toEqual([]);
    await request(server).get(`/conversations/${id}`).set('Cookie', ada).expect(200);
  });

  it('rejects bad input with a 400 before streaming', async () => {
    const id = await startConversation();

    const badModel = await send(id, { message: 'Hi', model: 'gpt-huge' }).expect(400);
    expect(badModel.body.message).toBe('Model "gpt-huge" is not available');
    await send(id, { message: '   ' }).expect(400);
    await send('not-a-uuid', { message: 'Hi' }).expect(400);

    expect(languageModel.requests).toEqual([]);
    const conversation = await request(app.getHttpServer())
      .get(`/conversations/${id}`)
      .set('Cookie', ada);
    expect(conversation.body.messages).toEqual([]);
  });

  it('requires a session', async () => {
    const server = app.getHttpServer();
    await request(server).get('/conversations').expect(401);
    await request(server).post('/conversations').expect(401);
    await request(server).get('/chat/models').expect(401);
  });

  it('lists the models and the default', async () => {
    const response = await request(app.getHttpServer())
      .get('/chat/models')
      .set('Cookie', ada)
      .expect(200);

    expect(response.body).toEqual({
      models: ['gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5.4'],
      default: 'gpt-5.4-mini',
    });
  });
});
