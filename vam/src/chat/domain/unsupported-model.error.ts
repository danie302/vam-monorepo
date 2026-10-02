import { DomainError } from '../../shared/domain/domain.error.ts';

export class UnsupportedModelError extends DomainError {
  constructor(model: string) {
    super(`Model "${model}" is not available`);
  }
}
