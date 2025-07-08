import NextLink from 'next/link';
import { ComponentProps } from 'react';

// Custom Link component that bypasses Next.js 15 typed routes issues
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink href={href as any} {...props} />;
}
