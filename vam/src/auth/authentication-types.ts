import type { SessionRecord } from '@nestjs/authentication';
import type { User } from '../user/domain/user.ts';

// Types `@CurrentUser()`, `@CurrentSession()` and `AuthenticationContext`.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
    session: SessionRecord;
  }
}
