import { RequireAuth } from '../../auth/presentation/auth-guards.tsx';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return <RequireAuth>{children}</RequireAuth>;
}
