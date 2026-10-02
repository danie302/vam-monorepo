import { EmailAlreadyRegisteredError } from '../../user/domain/email-already-registered.error.ts';
import { InMemoryUserRepository } from '../../user/infrastructure/in-memory/in-memory-user.repository.ts';
import { SignUpUseCase } from './sign-up.use-case.ts';
import { FakePasswordHasher, FakeSessionManager } from './testing/fakes.ts';

describe('SignUpUseCase', () => {
  let users: InMemoryUserRepository;
  let sessions: FakeSessionManager;
  let signUp: SignUpUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    sessions = new FakeSessionManager();
    signUp = new SignUpUseCase(users, new FakePasswordHasher(), sessions);
  });

  const command = {
    name: ' Ada ',
    email: ' Ada@Example.com',
    password: 'hunter22',
  };

  it('stores the user with a hashed password and signs them in', async () => {
    const user = await signUp.execute(command);

    expect(user.name).toBe('Ada');
    expect(user.email).toBe('ada@example.com');
    expect(user.passwordHash).toBe('v2:hunter22');
    expect(await users.findById(user.id)).toBe(user);
    expect(sessions.current).toBe(user.id);
  });

  it('refuses a taken email without signing in', async () => {
    await signUp.execute(command);
    await sessions.end();

    await expect(signUp.execute(command)).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
    expect(sessions.current).toBeNull();
  });
});
