import { InvalidFormError } from '../domain/auth.errors.ts';
import type { FieldErrors } from '../domain/credentials.ts';

/**
 * Splits an error thrown by a use case into what a form shows: messages
 * next to fields, or one message for the whole form.
 */
export function toFormError<T>(error: unknown): {
  fieldErrors: FieldErrors<T>;
  message: string | null;
} {
  if (error instanceof InvalidFormError) {
    return { fieldErrors: error.fieldErrors as FieldErrors<T>, message: null };
  }
  return {
    fieldErrors: {},
    message: error instanceof Error ? error.message : 'Something went wrong',
  };
}
