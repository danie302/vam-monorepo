export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
}

/** Validation message per field; a field with no entry is valid. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

// Same rules as the API (`vam/src/auth/presentation/http/dto`), checked
// here too so the user gets feedback before the request.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Checks the sign-in form. Password length is not checked: see the API. */
export function validateSignIn({
  email,
  password,
}: SignInCredentials): FieldErrors<SignInCredentials> {
  const errors: FieldErrors<SignInCredentials> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Enter your password';
  return errors;
}

/** Checks the sign-up form. */
export function validateSignUp({
  name,
  email,
  password,
}: SignUpCredentials): FieldErrors<SignUpCredentials> {
  const errors: FieldErrors<SignUpCredentials> = {};
  if (!name.trim()) errors.name = 'Enter your name';
  else if (name.trim().length > NAME_MAX_LENGTH) {
    errors.name = `At most ${NAME_MAX_LENGTH} characters`;
  }
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `At least ${PASSWORD_MIN_LENGTH} characters`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `At most ${PASSWORD_MAX_LENGTH} characters`;
  }
  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email';
  return undefined;
}
