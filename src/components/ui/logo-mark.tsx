'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cx } from './cx';

const loadedLogoSources = new Set<string>();
const failedLogoSources = new Set<string>();

export function LogoMark({
  className,
  imageClassName,
  src = '/icon-192.png',
}: {
  className?: string;
  imageClassName?: string;
  src?: string;
}) {
  const [loaded, setLoaded] = useState(() => loadedLogoSources.has(src));
  const [failed, setFailed] = useState(() => failedLogoSources.has(src));

  useEffect(() => {
    setLoaded(loadedLogoSources.has(src));
    setFailed(failedLogoSources.has(src));
  }, [src]);

  return (
    <span className={cx('relative overflow-hidden', className)}>
      <span className={cx('flex size-full items-center justify-center', failed ? '' : 'sr-only')}>W</span>
      {failed ? null : (
        <Image
          src={src}
          alt=""
          fill
          loading={loaded ? 'eager' : 'lazy'}
          sizes="48px"
          className={cx('object-contain', imageClassName)}
          onLoad={() => {
            loadedLogoSources.add(src);
            setLoaded(true);
          }}
          onError={() => {
            failedLogoSources.add(src);
            setFailed(true);
          }}
        />
      )}
    </span>
  );
}
