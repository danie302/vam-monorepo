'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from './auth-provider.tsx';

/** Renders its children only with a session; otherwise goes to sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <Guard allow="signed-in" redirectTo="/sign-in">
      {children}
    </Guard>
  );
}

/** For the sign-in/up pages: a signed-in user goes straight to the app. */
export function RequireGuest({ children }: { children: ReactNode }) {
  return (
    <Guard allow="signed-out" redirectTo="/">
      {children}
    </Guard>
  );
}

function Guard({
  allow,
  redirectTo,
  children,
}: {
  allow: 'signed-in' | 'signed-out';
  redirectTo: string;
  children: ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const mustLeave = status !== 'loading' && status !== allow;

  useEffect(() => {
    if (mustLeave) router.replace(redirectTo);
  }, [mustLeave, redirectTo, router]);

  if (status !== allow) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }
  return children;
}
