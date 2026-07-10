'use client';

import { Loader2 } from 'lucide-react';
import { cx } from './cx';

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cx('size-4 animate-spin', className)} aria-hidden="true" />;
}

export function ButtonLoadingContent({
  children,
  loading,
  spinnerClassName,
}: {
  children: React.ReactNode;
  loading?: boolean;
  spinnerClassName?: string;
}) {
  return (
    <>
      {loading ? <LoadingSpinner className={spinnerClassName} /> : null}
      {children}
    </>
  );
}