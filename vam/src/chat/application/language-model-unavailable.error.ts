import { DomainError } from '../../shared/domain/domain.error.ts';

/**
 * The language model failed (provider down, bad key, rate limit...). The
 * message is safe to show the user; the cause is kept for the logs.
 */
export class LanguageModelUnavailableError extends DomainError {
  constructor(message = 'The assistant is not available right now', options?: { cause?: unknown }) {
    super(message);
    this.cause = options?.cause;
  }
}
