'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../auth/presentation/auth-provider.tsx';
import { container } from '../container.ts';
import { ThemeProvider } from '../shared/presentation/theme/theme-provider.tsx';

/** Client-side providers: theme and the auth use cases from the container. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider useCases={container.auth}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
