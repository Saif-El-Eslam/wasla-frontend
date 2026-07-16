'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FieldValues, Path, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { resolveFieldError } from './form-error';

type FormInputProps<T extends FieldValues> = {
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  label?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'time' | 'password' | 'number';
  className?: string;
  autoComplete?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search';
};

export function FormInput<T extends FieldValues>({
  name,
  register,
  errors,
  placeholder,
  type = 'text',
  className,
  label,
  autoComplete,
  dir,
  inputMode,
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const commonT = useTranslations('common');
  const generatedId = useId();
  const error = resolveFieldError(errors, name);
  const inputId = `field-${generatedId}`;
  const errorId = `${inputId}-error`;

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={label ? 'text-sm font-medium text-muted-foreground' : 'sr-only'}
      >
        {label ?? placeholder ?? String(name)}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          {...register(name)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          dir={dir}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error?.message ? errorId : undefined}
          className={
            className ?? 'h-11 w-full rounded-xl border border-border px-3 outline-none focus:border-primary'
          }
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? commonT('hidePassword') : commonT('showPassword')}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error?.message ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-700">
          {String(error.message)}
        </p>
      ) : null}
    </div>
  );
}
