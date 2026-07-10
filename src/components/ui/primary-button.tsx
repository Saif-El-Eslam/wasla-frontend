'use client';

import { ButtonLoadingContent } from './loading-spinner';

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading = false,
  type = 'button',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md shadow-teal-200 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <ButtonLoadingContent loading={loading} spinnerClassName="text-white">
        {children}
      </ButtonLoadingContent>
    </button>
  );
}