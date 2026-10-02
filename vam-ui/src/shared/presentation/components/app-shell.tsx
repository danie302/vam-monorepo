import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import type { ReactNode } from 'react';
import { VamLogo } from './vam-logo.tsx';

/**
 * Full-height frame for signed-in pages: top bar with the logo and
 * `actions`, and `children` filling the rest (they scroll on their own).
 */
export function AppShell({
  actions,
  children,
}: {
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <VamLogo size={32} />
          {actions}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
