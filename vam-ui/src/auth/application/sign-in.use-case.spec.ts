import { beforeEach, describe, expect, it } from 'vitest';
import {
  InvalidCredentialsError,
  InvalidFormError,
} from '../domain/auth.errors.ts';
import { InMemoryAuthRepository } from '../infrastructure/in-memory/in-memory-auth.repository.ts';
import { SignInUseCase } from './sign-in.use-case.ts';

describe('SignInUseCase', () => {
  let repository: InMemoryAuthRepository;
  let signIn: SignInUseCase;

  beforeEach(async () => {
    repository = new InMemoryAuthRepository();
    await repository.signUp({ name: 'Ada', email: 'ada@vam.dev', password: 'secret-123' });
    await repository.signOut();
    signIn = new SignInUseCase(repository);
  });

  it('signs in with the right credentials', async () => {
    const user = await signIn.execute({ email: ' ada@vam.dev ', password: 'secret-123' });

    expect(user.name).toBe('Ada');
    expect(await repository.currentUser()).toEqual(user);
  });

  it('rejects a wrong password', async () => {
    await expect(
      signIn.execute({ email: 'ada@vam.dev', password: 'wrong-pass' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('reports invalid fields without calling the repository', async () => {
    const error = await signIn
      .execute({ email: 'not-an-email', password: '' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InvalidFormError);
    expect((error as InvalidFormError<unknown>).fieldErrors).toEqual({
      email: 'Enter a valid email',
      password: 'Enter your password',
    });
  });
});
