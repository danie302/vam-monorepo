/**
 * Base class of the errors the domain and the use cases throw. They know
 * nothing about HTTP: the presentation layer maps them to status codes.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
