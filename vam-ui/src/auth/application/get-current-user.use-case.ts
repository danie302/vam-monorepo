import { AuthRepository } from '../domain/auth.repository.ts';
import type { User } from '../domain/user.ts';

/** The signed-in user, or `null` when there is no session. */
export class GetCurrentUserUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(): Promise<User | null> {
    return this.auth.currentUser();
  }
}
