import { z } from 'zod';
import { validations } from '@/components/forms/form-validation';

export const branchSchema = z
  .object({
    name: z.object({
      en: z.string().trim(),
      ar: z.string().trim(),
    }),

    slug: z.string().trim().optional(),

    active: z.boolean(),

    phone: validations.phone(),
    whatsapp: validations.phone(),

    address: z.object({
      en: z.string().trim().optional(),
      ar: z.string().trim().optional(),
    }),

    logoUrl: validations.url(),
    coverUrl: validations.url(),
    googleMapsUrl: validations.url(),
    instagramUrl: validations.url(),

    openingHours: z.object({ from: z.string(), to: z.string() }).optional(),
  })
  .refine((data) => data.name.en.trim() || data.name.ar.trim(), {
    message: 'English or Arabic name is required',
    path: ['name', 'en'],
  });

export type BranchFormInput = z.input<typeof branchSchema>;
export type BranchFormValues = z.output<typeof branchSchema>;
