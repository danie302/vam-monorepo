'use client';

import Link, { type LinkProps } from '@mui/material/Link';
import NextLink from 'next/link';

/**
 * MUI `Link` styled, Next `Link` navigation. A client component so server
 * pages can use it: they cannot pass `NextLink` as `component` themselves.
 */
export function RouterLink(props: LinkProps & { href: string }) {
  return <Link component={NextLink} {...props} />;
}
