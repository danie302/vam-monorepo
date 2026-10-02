import { User } from '../../user/domain/user.ts';
import { UserRepository } from '../../user/domain/user.repository.ts';
import { PasswordHasher } from './ports/password-hasher.ts';
import { SessionManager } from './ports/session-manager.ts';

export interface SignUpCommand {
  name: string;
  email: string;
  password: string;
}

/** Registers a user and signs them in. */
export class SignUpUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionManager,
  ) {}

  /** Throws `EmailAlreadyRegisteredError` when the email is taken. */
  async execute({ name, email, password }: SignUpCommand): Promise<User> {
    const user = User.create({
      name,
      email,
      passwordHash: await this.hasher.hash(password),
    });
    await this.users.create(user);
    await this.sessions.start(user.id);
    return user;
  }
}
