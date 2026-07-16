'use client';

import { LoadingSpinner } from './loading-spinner';

export function IconButton({
  label,
  children,
  onClick,
  disabled,
  loading = false,
  className,
  ...buttonProps
}: {
  label: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled' | 'onClick'>) {
  return (
    <button
      className={
        className ||
        'flex size-10 items-center justify-center rounded-xl border border-border bg-white text-stone-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'
      }
      title={label}
      aria-label={label}
      aria-busy={loading || undefined}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
      {...buttonProps}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
