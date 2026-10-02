import type { SignInCredentials, SignUpCredentials } from './credentials.ts';
import type { User } from './user.ts';

/**
 * Port to wherever accounts and sessions live (the API in the app, memory
 * in tests). An abstract class rather than an interface so it exists at
 * runtime, like the backend ports.
 */
export abstract class AuthRepository {
  /** Throws `EmailAlreadyRegisteredError` when the email is taken. */
  abstract signUp(credentials: SignUpCredentials): Promise<User>;

  /** Throws `InvalidCredentialsError` when email or password is wrong. */
  abstract signIn(credentials: SignInCredentials): Promise<User>;

  abstract signOut(): Promise<void>;

  /** The signed-in user, or `null` when there is no session. */
  abstract currentUser(): Promise<User | null>;
}
