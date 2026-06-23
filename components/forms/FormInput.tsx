'use client';

import { FieldValues, Path, UseFormRegister, FieldErrors } from 'react-hook-form';

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  label?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'time';
  className?: string;
};

export function FormInput<T extends FieldValues>({
  name,
  register,
  errors,
  placeholder,
  type = 'text',
  className,
  label,
}: FormInputProps<T>) {
  const error = name.split('.').reduce<any>((acc, key) => acc?.[key], errors);

  return (
    <div>
      {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={
          className ?? 'h-11 w-full rounded-xl border border-border px-3 outline-none focus:border-primary'
        }
      />

      {error?.message ? (
        <p className="mt-1 text-xs font-medium text-red-700">{String(error.message)}</p>
      ) : null}
    </div>
  );
}
