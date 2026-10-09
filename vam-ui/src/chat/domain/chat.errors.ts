import { MESSAGE_MAX_LENGTH } from './message.ts';

export class EmptyMessageError extends Error {
  constructor() {
    super('Write a message first');
    this.name = 'EmptyMessageError';
  }
}

export class MessageTooLongError extends Error {
  constructor() {
    super(`Messages can have at most ${MESSAGE_MAX_LENGTH} characters`);
    this.name = 'MessageTooLongError';
  }
}

/** The assistant could not answer; the message is safe to show. */
export class AssistantUnavailableError extends Error {
  constructor(message = 'The assistant is not available right now') {
    super(message);
    this.name = 'AssistantUnavailableError';
  }
}

/** Missing, deleted, or someone else's. */
export class ConversationNotFoundError extends Error {
  constructor() {
    super('This conversation does not exist or was deleted');
    this.name = 'ConversationNotFoundError';
  }
}
