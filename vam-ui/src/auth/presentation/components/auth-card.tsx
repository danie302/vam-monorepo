import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { VamLogo } from '../../../shared/presentation/components/vam-logo.tsx';
import { brand } from '../../../shared/presentation/theme/brand.ts';

/** Centered card with the VAM logo, shared by the sign-in and sign-up pages. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        // Soft blue and red glows in opposite corners.
        backgroundImage: `radial-gradient(circle at 0% 0%, ${brand.blue}33, transparent 45%),
          radial-gradient(circle at 100% 100%, ${brand.red}33, transparent 45%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 5 },
          border: 1,
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          // Brand stripe on top of the card.
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 4,
            backgroundImage: brand.gradient,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <VamLogo size={52} withTagline />
        </Box>
        <Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 3 }}
        >
          {subtitle}
        </Typography>
        {children}
        <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>
      </Paper>
    </Box>
  );
}
