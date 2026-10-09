import { DomainError } from '../../shared/domain/domain.error.ts';

/** Missing, or someone else's: callers cannot tell which, on purpose. */
export class ConversationNotFoundError extends DomainError {
  constructor(readonly conversationId: string) {
    super('Conversation not found');
  }
}
