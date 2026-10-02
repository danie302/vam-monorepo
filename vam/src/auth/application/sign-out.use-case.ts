import { SessionManager } from './ports/session-manager.ts';

/** Signs the current client out. */
export class SignOutUseCase {
  constructor(private readonly sessions: SessionManager) {}

  /** Ends the session; a client without one is not an error. */
  async execute(): Promise<void> {
    await this.sessions.end();
  }
}
