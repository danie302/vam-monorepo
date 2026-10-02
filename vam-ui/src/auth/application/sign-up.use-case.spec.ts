import { beforeEach, describe, expect, it } from 'vitest';
import {
  EmailAlreadyRegisteredError,
  InvalidFormError,
} from '../domain/auth.errors.ts';
import { InMemoryAuthRepository } from '../infrastructure/in-memory/in-memory-auth.repository.ts';
import { SignUpUseCase } from './sign-up.use-case.ts';

describe('SignUpUseCase', () => {
  let repository: InMemoryAuthRepository;
  let signUp: SignUpUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    signUp = new SignUpUseCase(repository);
  });

  it('creates the account, trimmed, and signs in', async () => {
    const user = await signUp.execute({
      name: '  Ada ',
      email: 'ada@vam.dev',
      password: 'secret-123',
    });

    expect(user.name).toBe('Ada');
    expect(await repository.currentUser()).toEqual(user);
  });

  it('rejects an email that is already registered', async () => {
    const credentials = { name: 'Ada', email: 'ada@vam.dev', password: 'secret-123' };
    await signUp.execute(credentials);

    await expect(signUp.execute(credentials)).rejects.toBeInstanceOf(
      EmailAlreadyRegisteredError,
    );
  });

  it('requires a name and a password of at least 8 characters', async () => {
    const error = await signUp
      .execute({ name: ' ', email: 'ada@vam.dev', password: 'short' })
      .catch((e: unknown) => e);

    expect((error as InvalidFormError<unknown>).fieldErrors).toEqual({
      name: 'Enter your name',
      password: 'At least 8 characters',
    });
  });
});
