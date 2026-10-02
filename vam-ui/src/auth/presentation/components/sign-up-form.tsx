'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import {
  PASSWORD_MIN_LENGTH,
  type FieldErrors,
  type SignUpCredentials,
} from '../../domain/credentials.ts';
import { useAuth } from '../auth-provider.tsx';
import { toFormError } from '../form-error.ts';
import { PasswordField } from './password-field.tsx';

export function SignUpForm() {
  const { signUp } = useAuth();
  const [values, setValues] = useState<SignUpCredentials>({
    name: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignUpCredentials>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: keyof SignUpCredentials) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // On success the guard on this page redirects to the app.
      await signUp(values);
    } catch (error) {
      const formError = toFormError<SignUpCredentials>(error);
      setFieldErrors(formError.fieldErrors);
      setMessage(formError.message);
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" spacing={2} noValidate onSubmit={submit}>
      {message && <Alert severity="error">{message}</Alert>}
      <TextField
        label="Name"
        autoComplete="name"
        autoFocus
        value={values.name}
        onChange={(e) => change('name')(e.target.value)}
        error={Boolean(fieldErrors.name)}
        helperText={fieldErrors.name}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(e) => change('email')(e.target.value)}
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => change('password')(e.target.value)}
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password ?? `At least ${PASSWORD_MIN_LENGTH} characters`}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        size="large"
        loading={submitting}
      >
        Create account
      </Button>
    </Stack>
  );
}
