import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import { AuthCard } from '../../../auth/presentation/components/auth-card.tsx';
import { SignInForm } from '../../../auth/presentation/components/sign-in-form.tsx';
import { RouterLink } from '../../../shared/presentation/components/router-link.tsx';

export const metadata: Metadata = { title: 'Sign in · VAM' };

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to talk to your assistant"
      footer={
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <RouterLink href="/sign-up" sx={{ fontWeight: 600 }}>
            Sign up
          </RouterLink>
        </Typography>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
