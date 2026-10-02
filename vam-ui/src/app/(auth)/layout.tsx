import { RequireGuest } from '../../auth/presentation/auth-guards.tsx';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return <RequireGuest>{children}</RequireGuest>;
}
