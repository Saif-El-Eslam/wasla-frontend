'use client';

import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

type FormTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  label?: string;
  className?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
};

export function FormTextarea<T extends FieldValues>({
  name,
  register,
  errors,
  placeholder,
  className,
  label,
  dir,
}: FormTextareaProps<T>) {
  const error = name.split('.').reduce<any>((acc, key) => acc?.[key], errors);

  return (
    <div>
      {label ? <label className="text-sm font-medium text-muted-foreground">{label}</label> : null}
      <textarea
        {...register(name)}
        placeholder={placeholder}
        dir={dir}
        className={
          className ??
          'min-h-20 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary'
        }
      />
      {error?.message ? (
        <p className="mt-1 text-xs font-medium text-red-700">{String(error.message)}</p>
      ) : null}
    </div>
  );
}
