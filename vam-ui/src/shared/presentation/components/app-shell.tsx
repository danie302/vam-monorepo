'use client';

import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { VamLogo } from './vam-logo.tsx';

const SIDEBAR_WIDTH = 280;

/**
 * Full-height frame for signed-in pages: top bar with the logo and
 * `actions`, an optional `sidebar` (always shown on wide screens, a drawer
 * behind a menu button on narrow ones), and `children` filling the rest.
 */
export function AppShell({
  actions,
  sidebar,
  children,
}: {
  actions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [drawerPath, setDrawerPath] = useState(pathname);
  // Going somewhere from the drawer closes it.
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {sidebar && (
            <IconButton
              edge="start"
              aria-label="Open conversations"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <VamLogo size={32} />
          <Box sx={{ flex: 1 }} />
          {actions}
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {sidebar && (
          <>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {sidebar}
            </Box>
            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              sx={{ display: { md: 'none' } }}
              slotProps={{
                paper: {
                  // No dark-mode elevation tint: same surface as the wide sidebar.
                  sx: { width: SIDEBAR_WIDTH, maxWidth: '85vw', backgroundImage: 'none' },
                },
              }}
            >
              {sidebar}
            </Drawer>
          </>
        )}
        <Box component="main" sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
