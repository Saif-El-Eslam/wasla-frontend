'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cx } from './cx';

const loadedLogoSources = new Set<string>();
const failedLogoSources = new Set<string>();

export function LogoMark({
  className,
  imageClassName,
  shape = 'rounded',
  sizes = '48px',
  src,
}: {
  className?: string;
  imageClassName?: string;
  shape?: 'circle' | 'none' | 'rounded';
  sizes?: string;
  src?: string;
  variant?: 'mark' | 'wordmark';
}) {
  const resolvedSrc = src ?? '/favicon.svg'; // (variant === 'wordmark' ? '/wasla-wordmark.svg' : '/wasla-mark.svg');
  const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
    loadedLogoSources.has(resolvedSrc) ? resolvedSrc : null,
  );
  const [failedSrc, setFailedSrc] = useState<string | null>(() =>
    failedLogoSources.has(resolvedSrc) ? resolvedSrc : null,
  );
  const loaded = loadedLogoSources.has(resolvedSrc) || loadedSrc === resolvedSrc;
  const failed = failedLogoSources.has(resolvedSrc) || failedSrc === resolvedSrc;

  return (
    <span
      className={cx(
        'relative overflow-hidden',
        shape === 'circle' && 'rounded-full',
        shape === 'rounded' && 'rounded-sm',
        className,
      )}
    >
      <span className={cx('flex size-full items-center justify-center', failed ? '' : 'sr-only')}>W</span>
      {failed ? null : (
        <Image
          src={resolvedSrc}
          alt=""
          fill
          loading={loaded ? 'eager' : 'lazy'}
          sizes={sizes}
          className={cx('object-contain', imageClassName)}
          onLoad={() => {
            loadedLogoSources.add(resolvedSrc);
            setLoadedSrc(resolvedSrc);
          }}
          onError={() => {
            failedLogoSources.add(resolvedSrc);
            setFailedSrc(resolvedSrc);
          }}
        />
      )}
    </span>
  );
}
