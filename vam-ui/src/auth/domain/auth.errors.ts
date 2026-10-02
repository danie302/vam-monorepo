export class InvalidCredentialsError extends Error {
  constructor() {
    super('Incorrect email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An account with this email already exists');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

/** The form has invalid fields; `fieldErrors` says which and why. */
export class InvalidFormError<T> extends Error {
  constructor(readonly fieldErrors: Partial<Record<keyof T, string>>) {
    super('Check the highlighted fields');
    this.name = 'InvalidFormError';
  }
}
