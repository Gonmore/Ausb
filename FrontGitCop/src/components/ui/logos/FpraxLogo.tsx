import React from 'react';
import Image from 'next/image';

interface FpraxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical' | 'symbol' | 'negative' | 'monochrome';
  className?: string;
}

export function FpraxLogo({ size = 'md', variant = 'horizontal', className = '' }: FpraxLogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-20 w-auto';
      case 'md': return 'h-24 w-auto';
      case 'lg': return 'h-32 w-auto';
      case 'xl': return 'h-40 w-auto';
      default: return 'h-24 w-auto';
    }
  };

  const getImageSrc = () => {
    switch (variant) {
      case 'negative': return '/fprax-logo-monochrome.png';
      case 'monochrome': return '/fprax-logo-monochrome.png';
      default: return '/fprax-logo.png';
    }
  };

  const getImageStyle = () => {
    if (variant === 'negative') {
      return {
        objectFit: 'contain' as const,
        filter: 'invert(1) brightness(2)',
        mixBlendMode: 'screen' as const
      };
    }
    return { objectFit: 'contain' as const };
  };

  return (
    <Image
      src={getImageSrc()}
      alt="FPRAX Logo"
      width={400}
      height={120}
      className={`${getSizeClasses()} ${className}`}
      style={getImageStyle()}
      priority
    />
  );
}

export default FpraxLogo;
