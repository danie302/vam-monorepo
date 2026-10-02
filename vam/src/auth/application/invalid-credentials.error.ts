import { DomainError } from '../../shared/domain/domain.error.ts';

/** Same error for an unknown email and a wrong password: it must not tell them apart. */
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password');
  }
}
