'use client';

export function IconButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex size-10 items-center justify-center rounded-xl border border-border bg-white text-stone-600 transition hover:border-primary hover:text-primary disabled:opacity-50"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
