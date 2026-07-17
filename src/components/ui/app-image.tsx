'use client';

import Image, { type ImageLoaderProps, type ImageProps } from 'next/image';
import { useState } from 'react';
import { cx } from './cx';

const optimizedRemoteHosts = new Set(['images.unsplash.com', 'res.cloudinary.com']);

function passthroughLoader({ src }: ImageLoaderProps) {
  return src;
}

function needsPassthrough(src: ImageProps['src']) {
  if (typeof src !== 'string') {
    return false;
  }

  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return true;
  }

  try {
    const url = new URL(src);
    return url.protocol.startsWith('http') && !optimizedRemoteHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function AppImage({ alt, className, loader, onLoad, unoptimized, src, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const passthrough = needsPassthrough(src);

  return (
    <>
      <span
        className={cx(
          'pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(100deg,#f1f5f4_0%,#dff8f3_34%,#fff7df_48%,#f1f5f4_68%,#f1f5f4_100%)] bg-[length:240%_100%] transition-opacity duration-300',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
        aria-hidden="true"
        style={{ animation: loaded ? undefined : 'wasla-venue-skeleton 1.55s ease-in-out infinite' }}
      >
        <span
          className="absolute inset-y-0 w-1/3 rounded-full bg-white/35 blur-xl"
          style={{ animation: loaded ? undefined : 'wasla-search-loader-line 1.25s cubic-bezier(0.2, 0.8, 0.2, 1) infinite' }}
        />
      </span>
      <Image
        {...props}
        alt={alt}
        src={src}
        loader={passthrough ? passthroughLoader : loader}
        unoptimized={unoptimized ?? passthrough}
        className={className}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </>
  );
}
