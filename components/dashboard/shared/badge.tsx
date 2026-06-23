'use client';

import { cx } from './cx';

export function Badge({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'teal' | 'amber' | 'green' | 'red' | 'muted';
}) {
  const tones = {
    teal: 'border-teal-200 bg-teal-50 text-teal-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    muted: 'border-stone-200 bg-stone-100 text-stone-600',
  };

  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
