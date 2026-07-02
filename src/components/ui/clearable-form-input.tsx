'use client';

import { X } from 'lucide-react';
import type { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { cx } from '@/components/ui/cx';
import { FormInput } from '@/components/ui/form-input';

type ClearableFormInputProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  placeholder?: string;
  label?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  className?: string;
  clearLabel: string;
  dir?: 'ltr' | 'rtl' | 'auto';
};

export function ClearableFormInput<T extends FieldValues>({
  form,
  name,
  placeholder,
  label,
  type = 'text',
  className,
  clearLabel,
  dir,
}: ClearableFormInputProps<T>) {
  const value = form.watch(name);
  const hasValue = Boolean(String(value ?? '').trim());

  return (
    <div className="relative">
      <FormInput
        name={name}
        type={type}
        register={form.register}
        errors={form.formState.errors}
        placeholder={placeholder}
        label={label}
        className={cx(
          className ?? 'h-11 w-full rounded-xl border border-border px-3 outline-none focus:border-primary',
          'pe-11',
        )}
        dir={dir}
      />
      {hasValue ? (
        <button
          type="button"
          aria-label={clearLabel}
          title={clearLabel}
          className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-stone-100 hover:text-stone-950"
          onClick={() =>
            form.setValue(name, '' as PathValue<T, Path<T>>, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
