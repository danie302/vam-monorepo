import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { brand } from '../theme/brand.ts';

interface VamLogoProps {
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number;
  /** Shows "Virtual Assistant Manager" under the name. */
  withTagline?: boolean;
}

/** The VAM mark (gradient badge with a chat bubble) plus its wordmark. */
export function VamLogo({ size = 48, withTagline = false }: VamLogoProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${size / 4}px` }}>
      <VamMark size={size} />
      <Box>
        <Typography
          component="span"
          sx={{
            // inline-block: the gradient spans the letters, not the tagline.
            display: 'inline-block',
            fontSize: size * 0.62,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '0.04em',
            backgroundImage: brand.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          VAM
        </Typography>
        {withTagline && (
          <Typography
            component="span"
            variant="caption"
            sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}
          >
            Virtual Assistant Manager
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** Just the badge: a speech bubble with three dots on the brand gradient. */
export function VamMark({ size = 48 }: { size?: number }) {
  // Unique per instance: two marks on a page must not share a gradient id.
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="VAM"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={brand.blue} />
          <stop offset="50%" stopColor={brand.violet} />
          <stop offset="100%" stopColor={brand.red} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <path
        d="M16 20a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H29l-8 7v-7h1a6 6 0 0 1-6-6z"
        fill="#fff"
      />
      <circle cx="24" cy="27" r="2.6" fill={brand.blue} />
      <circle cx="32" cy="27" r="2.6" fill={brand.violet} />
      <circle cx="40" cy="27" r="2.6" fill={brand.red} />
    </svg>
  );
}
