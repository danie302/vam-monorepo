'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../auth/presentation/auth-provider.tsx';
import { VamLogo } from '../../shared/presentation/components/vam-logo.tsx';

/** Placeholder home until the chat exists. */
export default function HomePage() {
  const { user, signOut } = useAuth();
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <VamLogo size={32} />
          <Button color="secondary" startIcon={<LogoutIcon />} onClick={signOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Hi, {user?.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Chat with your assistant is coming soon.
        </Typography>
      </Container>
    </Box>
  );
}
