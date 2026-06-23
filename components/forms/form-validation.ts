import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const validations = {
  text: (message = 'Required') => z.string().trim().min(1, message),

  optionalText: () => z.string().trim().optional(),

  phone: () =>
    z.preprocess(
      emptyToUndefined,
      z
        .string()
        .regex(/^01[0-9]{9}$/, 'Invalid Egyptian phone')
        .optional(),
    ),

  email: () => z.preprocess(emptyToUndefined, z.email('Invalid email').optional()),

  url: () => z.preprocess(emptyToUndefined, z.url('Invalid URL').optional()),

  date: () => z.preprocess(emptyToUndefined, z.string().optional()),

  select: <T extends [string, ...string[]]>(values: T) => z.enum(values),

  timeRange: () =>
    z.object({
      from: z.string().min(1, 'Start time is required'),
      to: z.string().min(1, 'End time is required'),
    }),
};
