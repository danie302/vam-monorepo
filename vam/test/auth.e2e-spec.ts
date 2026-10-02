import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import request from 'supertest';
import { AppModule } from './../src/app.module.ts';

/** The session cookie, as the browser would send it back. */
function sessionCookie(response: request.Response): string {
  const setCookie = response.get('Set-Cookie') ?? [];
  const cookie = setCookie.find((value) => value.startsWith('__Host-sid='));
  expect(cookie).toBeDefined();
  return cookie!.split(';')[0];
}

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ logN: 10 }))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const account = {
    email: 'Ada@Example.com ',
    name: 'Ada',
    password: 'hunter22',
  };

  it('signs up, reads the current user, signs out', async () => {
    const server = app.getHttpServer();

    const signUp = await request(server)
      .post('/auth/sign-up')
      .send(account)
      .expect(201);
    expect(signUp.body).toMatchObject({
      email: 'ada@example.com',
      name: 'Ada',
    });
    expect(signUp.body).not.toHaveProperty('passwordHash');
    const cookie = sessionCookie(signUp);

    const me = await request(server)
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(me.body.email).toBe('ada@example.com');

    await request(server)
      .post('/auth/sign-out')
      .set('Cookie', cookie)
      .expect(204);
    await request(server).get('/auth/me').set('Cookie', cookie).expect(401);
  });

  it('signs in with the right password only', async () => {
    const server = app.getHttpServer();
    await request(server).post('/auth/sign-up').send(account).expect(201);

    await request(server)
      .post('/auth/sign-in')
      .send({ email: account.email, password: 'wrong-password' })
      .expect(401);
    await request(server)
      .post('/auth/sign-in')
      .send({ email: 'nobody@example.com', password: account.password })
      .expect(401);

    const signIn = await request(server)
      .post('/auth/sign-in')
      .send({ email: 'ada@example.com', password: account.password })
      .expect(200);
    await request(server)
      .get('/auth/me')
      .set('Cookie', sessionCookie(signIn))
      .expect(200);
  });

  it('rejects a duplicate email and invalid input', async () => {
    const server = app.getHttpServer();
    await request(server).post('/auth/sign-up').send(account).expect(201);
    await request(server).post('/auth/sign-up').send(account).expect(409);

    await request(server)
      .post('/auth/sign-up')
      .send({ email: 'not-an-email', name: '', password: 'short' })
      .expect(400);
  });

  it('requires a session on protected routes', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
