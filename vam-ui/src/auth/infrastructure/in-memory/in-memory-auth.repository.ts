import { AuthRepository } from '../../domain/auth.repository.ts';
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from '../../domain/auth.errors.ts';
import type {
  SignInCredentials,
  SignUpCredentials,
} from '../../domain/credentials.ts';
import type { User } from '../../domain/user.ts';

/** `AuthRepository` in memory: for tests and working on the UI without the API. */
export class InMemoryAuthRepository extends AuthRepository {
  private readonly accounts = new Map<string, { user: User; password: string }>();
  private signedIn: User | null = null;

  async signUp({ name, email, password }: SignUpCredentials): Promise<User> {
    const key = email.toLowerCase();
    if (this.accounts.has(key)) throw new EmailAlreadyRegisteredError();
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email: key,
      createdAt: new Date(),
    };
    this.accounts.set(key, { user, password });
    this.signedIn = user;
    return user;
  }

  async signIn({ email, password }: SignInCredentials): Promise<User> {
    const account = this.accounts.get(email.toLowerCase());
    if (!account || account.password !== password) {
      throw new InvalidCredentialsError();
    }
    this.signedIn = account.user;
    return account.user;
  }

  async signOut(): Promise<void> {
    this.signedIn = null;
  }

  async currentUser(): Promise<User | null> {
    return this.signedIn;
  }
}
