import { Module } from '@nestjs/common';
import { UserRepository } from '../user/domain/user.repository.ts';
import { PasswordHasher } from './application/ports/password-hasher.ts';
import { SessionManager } from './application/ports/session-manager.ts';
import { SignInUseCase } from './application/sign-in.use-case.ts';
import { SignOutUseCase } from './application/sign-out.use-case.ts';
import { SignUpUseCase } from './application/sign-up.use-case.ts';
import { CookieSessionManager } from './infrastructure/nest-authentication/cookie-session-manager.ts';
import { ScryptPasswordHasher } from './infrastructure/nest-authentication/scrypt-password-hasher.ts';
import { SessionAuthProvider } from './infrastructure/nest-authentication/session-auth.provider.ts';
import { AuthController } from './presentation/http/auth.controller.ts';

@Module({
  controllers: [AuthController],
  providers: [
    // Ports → adapters.
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: SessionManager, useClass: CookieSessionManager },
    SessionAuthProvider,

    // The use cases are plain classes: wired here, not decorated.
    {
      provide: SignUpUseCase,
      useFactory: (
        users: UserRepository,
        hasher: PasswordHasher,
        sessions: SessionManager,
      ) => new SignUpUseCase(users, hasher, sessions),
      inject: [UserRepository, PasswordHasher, SessionManager],
    },
    {
      provide: SignInUseCase,
      useFactory: (
        users: UserRepository,
        hasher: PasswordHasher,
        sessions: SessionManager,
      ) => new SignInUseCase(users, hasher, sessions),
      inject: [UserRepository, PasswordHasher, SessionManager],
    },
    {
      provide: SignOutUseCase,
      useFactory: (sessions: SessionManager) => new SignOutUseCase(sessions),
      inject: [SessionManager],
    },
  ],
})
export class AuthModule {}
