import { User } from './user.ts';

/**
 * Port: where users are stored. The domain and the use cases depend on this
 * class only; each database has its own implementation in `infrastructure/`.
 * An abstract class rather than an interface so it can be Nest's
 * injection token.
 */
export abstract class UserRepository {
  /** Throws `EmailAlreadyRegisteredError` when the email is taken. */
  abstract create(user: User): Promise<void>;

  /** Saves the changes of an existing user. */
  abstract update(user: User): Promise<void>;

  /** The user with this id, or `null`. */
  abstract findById(id: string): Promise<User | null>;

  /** `email` is normalized by the caller (`User.normalizeEmail()`). */
  abstract findByEmail(email: string): Promise<User | null>;
}
