import { Injectable } from '@nestjs/common';
import { SignInService } from '@nestjs/authentication';
import { SessionManager } from '../../application/ports/session-manager.ts';

/**
 * `SessionManager` on `@nestjs/authentication`'s cookie sessions: reads and
 * sets the cookie of the request being handled.
 */
@Injectable()
export class CookieSessionManager extends SessionManager {
  constructor(private readonly signInService: SignInService) {
    super();
  }

  /** Creates a session and sets its cookie on the response. */
  async start(userId: string): Promise<void> {
    await this.signInService.signIn(userId, { method: 'password' });
  }

  /** Deletes the session and clears its cookie. */
  async end(): Promise<void> {
    await this.signInService.signOut();
  }
}
