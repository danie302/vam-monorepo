import { User } from '../../user/domain/user.ts';
import { InMemoryUserRepository } from '../../user/infrastructure/in-memory/in-memory-user.repository.ts';
import { InvalidCredentialsError } from './invalid-credentials.error.ts';
import { SignInUseCase } from './sign-in.use-case.ts';
import { FakePasswordHasher, FakeSessionManager } from './testing/fakes.ts';

describe('SignInUseCase', () => {
  let users: InMemoryUserRepository;
  let hasher: FakePasswordHasher;
  let sessions: FakeSessionManager;
  let signIn: SignInUseCase;
  let ada: User;

  beforeEach(async () => {
    users = new InMemoryUserRepository();
    hasher = new FakePasswordHasher();
    sessions = new FakeSessionManager();
    signIn = new SignInUseCase(users, hasher, sessions);

    ada = User.create({
      name: 'Ada',
      email: 'ada@example.com',
      passwordHash: await hasher.hash('hunter22'),
    });
    await users.create(ada);
  });

  it('signs in with the right password, whatever the email case', async () => {
    const user = await signIn.execute({
      email: ' ADA@example.com',
      password: 'hunter22',
    });

    expect(user.id).toBe(ada.id);
    expect(sessions.current).toBe(ada.id);
  });

  it.each([
    ['a wrong password', 'ada@example.com', 'wrong'],
    ['an unknown email', 'nobody@example.com', 'hunter22'],
  ])('refuses %s with the same error', async (_, email, password) => {
    await expect(signIn.execute({ email, password })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    expect(sessions.current).toBeNull();
  });

  it('rehashes a password stored with old settings', async () => {
    hasher.version = 'v3';

    await signIn.execute({ email: 'ada@example.com', password: 'hunter22' });

    expect((await users.findById(ada.id))?.passwordHash).toBe('v3:hunter22');
  });
});
