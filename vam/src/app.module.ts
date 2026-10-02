import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.ts';
import { trustedOrigins } from './config/origins.config.ts';
import { DatabaseModule } from './database/database.module.ts';

@Module({
  imports: [
    DatabaseModule,
    // Global guard: every route needs a session unless marked `@Public()`.
    AuthenticationModule.forRoot({
      session: { trustedOrigins },
      // Sessions are in the database; `mfa` and `refreshTokens` stay in
      // memory, which is safe while MFA and tokens are unused. Implement
      // their stores before enabling either.
      allowInMemoryStorage: true,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [
    // Validates `@Body({ schema })` and friends with their zod schema.
    { provide: APP_PIPE, useValue: new StandardSchemaValidationPipe() },
  ],
})
export class AppModule {}
