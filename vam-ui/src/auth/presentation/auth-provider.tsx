'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUseCases } from '../auth.module.ts';
import type { SignInCredentials, SignUpCredentials } from '../domain/credentials.ts';
import type { User } from '../domain/user.ts';

type AuthStatus = 'loading' | 'signed-in' | 'signed-out';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the session state for the whole app and exposes the auth use cases
 * to components. It receives the use cases, so it never knows about HTTP.
 */
export function AuthProvider({
  useCases,
  children,
}: {
  useCases: AuthUseCases;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    useCases.getCurrentUser
      .execute()
      .catch(() => null) // API unreachable: treat as signed out.
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus(current ? 'signed-in' : 'signed-out');
      });
    return () => {
      cancelled = true;
    };
  }, [useCases]);

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      setUser(await useCases.signIn.execute(credentials));
      setStatus('signed-in');
    },
    [useCases],
  );

  const signUp = useCallback(
    async (credentials: SignUpCredentials) => {
      setUser(await useCases.signUp.execute(credentials));
      setStatus('signed-in');
    },
    [useCases],
  );

  const signOut = useCallback(async () => {
    await useCases.signOut.execute();
    setUser(null);
    setStatus('signed-out');
  }, [useCases]);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
