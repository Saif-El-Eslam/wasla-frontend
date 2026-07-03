'use client';

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button
      type={type}
      className={
        className
          ? className
          : 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold transition hover:brightness-95 disabled:opacity-55'
      }
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
