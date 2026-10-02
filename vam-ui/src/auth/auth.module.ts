import { GetCurrentUserUseCase } from './application/get-current-user.use-case.ts';
import { SignInUseCase } from './application/sign-in.use-case.ts';
import { SignOutUseCase } from './application/sign-out.use-case.ts';
import { SignUpUseCase } from './application/sign-up.use-case.ts';
import { AuthRepository } from './domain/auth.repository.ts';

/** The auth use cases, as the presentation layer receives them. */
export interface AuthUseCases {
  signIn: SignInUseCase;
  signUp: SignUpUseCase;
  signOut: SignOutUseCase;
  getCurrentUser: GetCurrentUserUseCase;
}

/** Wires the auth use cases to a repository: `container.ts` picks which. */
export function createAuthModule(repository: AuthRepository): AuthUseCases {
  return {
    signIn: new SignInUseCase(repository),
    signUp: new SignUpUseCase(repository),
    signOut: new SignOutUseCase(repository),
    getCurrentUser: new GetCurrentUserUseCase(repository),
  };
}
