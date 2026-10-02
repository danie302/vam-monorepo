'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import type { FieldErrors, SignInCredentials } from '../../domain/credentials.ts';
import { useAuth } from '../auth-provider.tsx';
import { toFormError } from '../form-error.ts';
import { PasswordField } from './password-field.tsx';

export function SignInForm() {
  const { signIn } = useAuth();
  const [values, setValues] = useState<SignInCredentials>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInCredentials>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: keyof SignInCredentials) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      // On success the guard on this page redirects to the app.
      await signIn(values);
    } catch (error) {
      const formError = toFormError<SignInCredentials>(error);
      setFieldErrors(formError.fieldErrors);
      setMessage(formError.message);
      setSubmitting(false);
    }
  }

  return (
    <Stack component="form" spacing={2} noValidate onSubmit={submit}>
      {message && <Alert severity="error">{message}</Alert>}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        value={values.email}
        onChange={(e) => change('email')(e.target.value)}
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
      />
      <PasswordField
        label="Password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => change('password')(e.target.value)}
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password}
      />
      <Button type="submit" variant="contained" size="large" loading={submitting}>
        Sign in
      </Button>
    </Stack>
  );
}
