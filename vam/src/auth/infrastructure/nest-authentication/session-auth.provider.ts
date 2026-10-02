import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import { User } from '../../../user/domain/user.ts';
import { UserRepository } from '../../../user/domain/user.repository.ts';

/** Authenticates requests by their session cookie. */
@Injectable()
export class SessionAuthProvider extends SessionCookieProvider<User> {
  constructor(
    private readonly users: UserRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  /** A deleted user ends the session. */
  protected validate(session: SessionRecord): Promise<User | null> {
    return this.users.findById(session.userId);
  }
}
