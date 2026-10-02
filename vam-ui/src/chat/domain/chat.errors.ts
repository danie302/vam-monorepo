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
