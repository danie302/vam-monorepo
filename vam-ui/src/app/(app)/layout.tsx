import { RequireAuth } from '../../auth/presentation/auth-guards.tsx';
import { UserMenu } from '../../auth/presentation/components/user-menu.tsx';
import { AppShell } from '../../shared/presentation/components/app-shell.tsx';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <RequireAuth>
      <AppShell actions={<UserMenu />}>{children}</AppShell>
    </RequireAuth>
  );
}
