import type { FieldError, FieldErrors, FieldValues, Path } from 'react-hook-form';

export function resolveFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  name: Path<T>,
): FieldError | undefined {
  let current: unknown = errors;

  for (const segment of name.split('.')) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current && typeof current === 'object' && 'message' in current
    ? (current as FieldError)
    : undefined;
}
