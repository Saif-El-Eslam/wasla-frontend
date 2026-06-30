'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { cx } from '@/components/ui/dashboard-ui';

export function AdminFormToggle({
  label,
  register,
  className,
}: {
  label: string;
  register: UseFormRegisterReturn;
  className?: string;
}) {
  return (
    <label
      className={cx(
        'flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 text-sm font-bold',
        className,
      )}
    >
      <span>{label}</span>
      <input className="size-4 accent-primary" type="checkbox" {...register} />
    </label>
  );
}
