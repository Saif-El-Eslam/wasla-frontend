'use client';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import type { Control, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { resolveFieldError } from './form-error';

type Option = {
  value: string;
  label: string;
};

type FormListboxProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: Option[];
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function FormListbox<T extends FieldValues>({
  name,
  control,
  errors,
  options,
  label,
  className,
  disabled,
}: FormListboxProps<T>) {
  const error = resolveFieldError(errors, name);

  return (
    <div className="min-w-0">
      {label ? (
        <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">{label}</label>
      ) : null}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find((option) => option.value === field.value);

          return (
            <Listbox value={field.value} onChange={field.onChange} disabled={disabled}>
              <div className="relative">
                <ListboxButton
                  className={
                    className ??
                    'flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3 text-left text-sm font-medium text-stone-900 shadow-sm outline-none transition hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 disabled:opacity-70'
                  }
                >
                  <span className="truncate">{selectedOption?.label ?? 'Select option'}</span>
                  <ChevronDown className="size-4 shrink-0 text-stone-400" />
                </ListboxButton>

                <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-border bg-white p-1 shadow-xl outline-none">
                  {options.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-stone-800 transition data-focus:bg-primary/10 data-selected:text-primary"
                    >
                      <span className="truncate">{option.label}</span>
                      <Check className="invisible size-4 text-primary group-data-selected:visible" />
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          );
        }}
      />

      {error?.message ? (
        <p className="mt-1.5 text-xs font-semibold text-red-700">{String(error.message)}</p>
      ) : null}
    </div>
  );
}
