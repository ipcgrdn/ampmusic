'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  alt,
  fallbackSrc = '/logo.png',
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      src={error ? fallbackSrc : props.src}
      onError={() => setError(true)}
    />
  );
} 