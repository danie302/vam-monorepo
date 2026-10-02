import { AuthRepository } from '../domain/auth.repository.ts';

/** Ends the session. */
export class SignOutUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(): Promise<void> {
    return this.auth.signOut();
  }
}
