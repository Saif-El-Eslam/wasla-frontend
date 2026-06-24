import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export function normalizeEgyptPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('20') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;

  if (!/^1\d{9}$/.test(local)) {
    return null;
  }

  return `+20${local}`;
}

export const fieldValidations = {
  text: (message = 'Required') => z.string().trim().min(1, message),

  optionalText: () => z.string().trim().optional(),

  name: () => z.string().trim().min(2, 'Name must be at least 2 characters').max(120),

  password: () => z.string().min(8, 'Password must be at least 8 characters').max(128),

  egyptPhone: () =>
    z
      .string()
      .trim()
      .min(8)
      .max(32)
      .transform((value, ctx) => {
        const normalized = normalizeEgyptPhone(value);

        if (!normalized) {
          ctx.addIssue({
            code: 'custom',
            message: 'Phone number must be an Egyptian mobile number',
          });
          return z.NEVER;
        }

        return normalized;
      }),

  optionalEgyptPhone: () => z.preprocess(emptyToUndefined, fieldValidations.egyptPhone().optional()),

  email: () => z.preprocess(emptyToUndefined, z.email('Invalid email').optional()),

  url: () => z.preprocess(emptyToUndefined, z.url('Invalid URL').optional()),

  date: () => z.preprocess(emptyToUndefined, z.string().optional()),

  select: <T extends [string, ...string[]]>(values: T) => z.enum(values),

  uuid: (message = 'Invalid ID') => z.string().uuid(message),

  uuidArray: (message = 'Select at least one item') => z.array(z.string().uuid()).min(1, message),

  localizedDraft: () =>
    z.object({
      en: z.string().trim(),
      ar: z.string().trim(),
    }),

  optionalLocalizedDraft: () =>
    z.object({
      en: z.string().trim().optional(),
      ar: z.string().trim().optional(),
    }),

  otp: () => z.string().trim().length(6, 'Verification code must be 6 digits'),

  optionalSlug: () => z.string().trim().optional(),

  categoryId: () => z.string().min(1, 'Category is required'),

  tagsText: () => z.string().trim().optional(),

  optionalNonNegativeNumber: () =>
    z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().optional()),

  optionalNonNegativeInteger: () =>
    z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional()),

  priceDraft: () =>
    z.object({
      label: z.string().trim(),
      price: z.string().trim(),
    }),

  openingHours: () => z.object({ from: z.string(), to: z.string() }).optional(),

  timeRange: () =>
    z.object({
      from: z.string().min(1, 'Start time is required'),
      to: z.string().min(1, 'End time is required'),
    }),
};

export const validations = {
  text: fieldValidations.text,

  optionalText: fieldValidations.optionalText,

  phone: fieldValidations.optionalEgyptPhone,

  requiredPhone: fieldValidations.egyptPhone,

  email: fieldValidations.email,

  url: fieldValidations.url,

  date: fieldValidations.date,

  select: fieldValidations.select,

  timeRange: fieldValidations.timeRange,
};
