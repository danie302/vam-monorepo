'use client';

import { createTheme } from '@mui/material/styles';
import { brand } from './brand.ts';

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand.blue, dark: brand.blueDark },
        secondary: { main: brand.red, dark: brand.redDark },
        error: { main: '#DC2626' },
        background: { default: '#F4F6FB', paper: '#FFFFFF' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#60A5FA', dark: brand.blue },
        secondary: { main: '#FB7185', dark: brand.red },
        background: { default: '#0B1020', paper: '#121933' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-roboto), system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { paddingBlock: 10 } },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
  },
});
