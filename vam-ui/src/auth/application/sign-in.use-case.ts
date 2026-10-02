import { AuthRepository } from '../domain/auth.repository.ts';
import { InvalidFormError } from '../domain/auth.errors.ts';
import {
  hasErrors,
  validateSignIn,
  type SignInCredentials,
} from '../domain/credentials.ts';
import type { User } from '../domain/user.ts';

/** Checks the form and signs the user in. */
export class SignInUseCase {
  constructor(private readonly auth: AuthRepository) {}

  /** Throws `InvalidFormError` or `InvalidCredentialsError`. */
  async execute(credentials: SignInCredentials): Promise<User> {
    const errors = validateSignIn(credentials);
    if (hasErrors(errors)) throw new InvalidFormError(errors);
    return this.auth.signIn({
      email: credentials.email.trim(),
      password: credentials.password,
    });
  }
}
