import { EmailAlreadyRegisteredError } from '../../domain/email-already-registered.error.ts';
import { User } from '../../domain/user.ts';
import { UserRepository } from '../../domain/user.repository.ts';

/** Keeps users in a `Map`: for tests, and a reference for new adapters. */
export class InMemoryUserRepository extends UserRepository {
  private readonly users = new Map<string, User>();

  /** Adds the user, refusing a taken email like a unique index would. */
  async create(user: User): Promise<void> {
    if (await this.findByEmail(user.email)) {
      throw new EmailAlreadyRegisteredError(user.email);
    }
    this.users.set(user.id, user);
  }

  /** Replaces the stored user; unknown ids are ignored. */
  async update(user: User): Promise<void> {
    if (this.users.has(user.id)) {
      this.users.set(user.id, user);
    }
  }

  /** Looks the user up by id. */
  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  /** Scans the users for this email. */
  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
}
