import { z } from 'zod';
import { fieldValidations } from '@/components/ui/form-validation';

export const branchSchema = z
  .object({
    name: fieldValidations.localizedDraft(),

    slug: fieldValidations.optionalSlug(),

    active: z.boolean(),

    phone: fieldValidations.optionalEgyptPhone(),
    whatsapp: fieldValidations.optionalEgyptPhone(),

    address: fieldValidations.optionalLocalizedDraft(),

    logoUrl: fieldValidations.url(),
    coverUrl: fieldValidations.url(),
    googleMapsUrl: fieldValidations.url(),
    instagramUrl: fieldValidations.url(),
    facebookUrl: fieldValidations.url(),

    openingHours: fieldValidations.openingHours(),
  })
  .refine((data) => data.name.en.trim() || data.name.ar.trim(), {
    message: 'English or Arabic name is required',
    path: ['name', 'en'],
  });

export type BranchFormInput = z.input<typeof branchSchema>;
export type BranchFormValues = z.output<typeof branchSchema>;
