import { User } from '../../user/domain/user.ts';
import { UserRepository } from '../../user/domain/user.repository.ts';
import { InvalidCredentialsError } from './invalid-credentials.error.ts';
import { PasswordHasher } from './ports/password-hasher.ts';
import { SessionManager } from './ports/session-manager.ts';

export interface SignInCommand {
  email: string;
  password: string;
}

/** Checks a user's password and signs them in. */
export class SignInUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionManager,
  ) {}

  /** Returns the signed-in user, or throws `InvalidCredentialsError`. */
  async execute({ email, password }: SignInCommand): Promise<User> {
    let user = await this.users.findByEmail(User.normalizeEmail(email));
    // Verifies even for unknown emails, so the response time does not
    // reveal which accounts exist.
    const valid = await this.hasher.verify(password, user?.passwordHash);
    if (!user || !valid) {
      throw new InvalidCredentialsError();
    }

    if (this.hasher.needsRehash(user.passwordHash)) {
      user = user.withPasswordHash(await this.hasher.hash(password));
      await this.users.update(user);
    }

    await this.sessions.start(user.id);
    return user;
  }
}
