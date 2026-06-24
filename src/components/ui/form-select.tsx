'use client';

import type { ReactNode } from 'react';
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  children: ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function FormSelect<T extends FieldValues>({
  name,
  register,
  errors,
  children,
  className,
  label,
  disabled,
}: FormSelectProps<T>) {
  const error = name.split('.').reduce<any>((acc, key) => acc?.[key], errors);

  return (
    <div>
      {label ? <label className="text-sm font-medium text-muted-foreground">{label}</label> : null}
      <select
        {...register(name)}
        disabled={disabled}
        className={
          className ?? 'h-11 w-full rounded-xl border border-border px-3 outline-none focus:border-primary'
        }
      >
        {children}
      </select>
      {error?.message ? (
        <p className="mt-1 text-xs font-medium text-red-700">{String(error.message)}</p>
      ) : null}
    </div>
  );
}
