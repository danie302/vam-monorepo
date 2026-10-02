import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import { AuthCard } from '../../../auth/presentation/components/auth-card.tsx';
import { SignUpForm } from '../../../auth/presentation/components/sign-up-form.tsx';
import { RouterLink } from '../../../shared/presentation/components/router-link.tsx';

export const metadata: Metadata = { title: 'Sign up · VAM' };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start using your virtual assistant"
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <RouterLink href="/sign-in" sx={{ fontWeight: 600 }}>
            Sign in
          </RouterLink>
        </Typography>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
