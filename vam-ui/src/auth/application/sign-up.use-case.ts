import { AuthRepository } from '../domain/auth.repository.ts';
import { InvalidFormError } from '../domain/auth.errors.ts';
import {
  hasErrors,
  validateSignUp,
  type SignUpCredentials,
} from '../domain/credentials.ts';
import type { User } from '../domain/user.ts';

/** Checks the form, creates the account and signs the user in. */
export class SignUpUseCase {
  constructor(private readonly auth: AuthRepository) {}

  /** Throws `InvalidFormError` or `EmailAlreadyRegisteredError`. */
  async execute(credentials: SignUpCredentials): Promise<User> {
    const errors = validateSignUp(credentials);
    if (hasErrors(errors)) throw new InvalidFormError(errors);
    return this.auth.signUp({
      name: credentials.name.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
    });
  }
}
