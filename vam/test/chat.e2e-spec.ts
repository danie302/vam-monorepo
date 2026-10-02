import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import request from 'supertest';
import { AppModule } from './../src/app.module.ts';
import { LanguageModel } from '../src/chat/application/ports/language-model.ts';
import { FakeLanguageModel } from '../src/chat/infrastructure/fake/fake-language-model.ts';

/** Parses a `text/event-stream` body into `{ event, data }` pairs. */
function parseEvents(body: string): { event: string; data: unknown }[] {
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
  let cookie: string;

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

    const signUp = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ email: 'ada@example.com', name: 'Ada', password: 'hunter22' })
      .expect(201);
    cookie = signUp.get('Set-Cookie')![0].split(';')[0];
  });

  afterEach(async () => {
    await app.close();
  });

  it('streams the answer as delta events, then done', async () => {
    languageModel.chunks = ['Hello', ', Ada', '!'];

    const response = await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Cookie', cookie)
      .send({ message: 'Hi', model: 'gpt-5.4-nano' })
      .expect(200)
      .expect('Content-Type', /text\/event-stream/);

    expect(parseEvents(response.text)).toEqual([
      { event: 'delta', data: { text: 'Hello' } },
      { event: 'delta', data: { text: ', Ada' } },
      { event: 'delta', data: { text: '!' } },
      { event: 'done', data: {} },
    ]);
    expect(languageModel.requests[0]).toMatchObject({
      model: 'gpt-5.4-nano',
      message: 'Hi',
    });
  });

  it('uses the default model when the request names none', async () => {
    await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Cookie', cookie)
      .send({ message: 'Hi' })
      .expect(200);

    expect(languageModel.requests[0].model).toBe('gpt-5.4-mini');
  });

  it('ends with an error event when the model fails mid-answer', async () => {
    languageModel.chunks = ['Hel', 'lo'];
    languageModel.failAfter = 1;

    const response = await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Cookie', cookie)
      .send({ message: 'Hi' })
      .expect(200);

    expect(parseEvents(response.text)).toEqual([
      { event: 'delta', data: { text: 'Hel' } },
      { event: 'error', data: { message: 'The assistant is not available right now' } },
    ]);
  });

  it('rejects a model outside CHAT_MODELS with a 400, before streaming', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Cookie', cookie)
      .send({ message: 'Hi', model: 'gpt-huge' })
      .expect(400);

    expect(response.body.message).toBe('Model "gpt-huge" is not available');
    expect(languageModel.requests).toEqual([]);
  });

  it('rejects an empty message with a 400', async () => {
    await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Cookie', cookie)
      .send({ message: '   ' })
      .expect(400);
  });

  it('requires a session', async () => {
    await request(app.getHttpServer())
      .post('/chat/messages')
      .send({ message: 'Hi' })
      .expect(401);
    await request(app.getHttpServer()).get('/chat/models').expect(401);
  });

  it('lists the models and the default', async () => {
    const response = await request(app.getHttpServer())
      .get('/chat/models')
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toEqual({
      models: ['gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5.4'],
      default: 'gpt-5.4-mini',
    });
  });
});
