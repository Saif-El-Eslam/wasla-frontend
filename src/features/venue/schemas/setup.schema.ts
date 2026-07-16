import { z } from 'zod';
import { fieldValidations } from '@/components/ui/form-validation';

export const setupSchema = z
  .object({
    type: z.enum([
      'RESTAURANT',
      'CAFE',
      'BAKERY',
      'DESSERT_SHOP',
      'FOOD_TRUCK',
      'CLOUD_KITCHEN',
      'CATERING',
      'LOUNGE',
      'OTHER',
    ]),
    name: fieldValidations.localizedDraft(),
    branchName: fieldValidations.localizedDraft(),
    phone: fieldValidations.optionalEgyptPhone(),
    whatsapp: fieldValidations.optionalEgyptPhone(),
    address: fieldValidations.optionalLocalizedDraft(),
  })
  .refine((data) => data.name.en || data.name.ar, {
    message: 'English or Arabic venue name is required',
    path: ['name', 'en'],
  });

export type SetupFormInput = z.input<typeof setupSchema>;
export type SetupFormValues = z.output<typeof setupSchema>;
