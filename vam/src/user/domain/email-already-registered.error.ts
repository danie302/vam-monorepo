import { DomainError } from '../../shared/domain/domain.error.ts';

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(readonly email: string) {
    super('Email is already registered');
  }
}
