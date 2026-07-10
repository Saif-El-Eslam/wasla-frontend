'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cx } from './cx';

const loadedLogoSources = new Set<string>();
const failedLogoSources = new Set<string>();

export function LogoMark({
  className,
  imageClassName,
  shape = 'rounded',
  sizes = '48px',
  src,
  variant = 'mark',
}: {
  className?: string;
  imageClassName?: string;
  shape?: 'circle' | 'none' | 'rounded';
  sizes?: string;
  src?: string;
  variant?: 'mark' | 'wordmark';
}) {
  const resolvedSrc = src ?? '/favicon.svg'; // (variant === 'wordmark' ? '/wasla-wordmark.svg' : '/wasla-mark.svg');
  const [loaded, setLoaded] = useState(() => loadedLogoSources.has(resolvedSrc));
  const [failed, setFailed] = useState(() => failedLogoSources.has(resolvedSrc));

  useEffect(() => {
    setLoaded(loadedLogoSources.has(resolvedSrc));
    setFailed(failedLogoSources.has(resolvedSrc));
  }, [resolvedSrc]);

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
            setLoaded(true);
          }}
          onError={() => {
            failedLogoSources.add(resolvedSrc);
            setFailed(true);
          }}
        />
      )}
    </span>
  );
}
