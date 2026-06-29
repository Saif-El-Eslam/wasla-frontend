import { z } from 'zod';
import { fieldValidations } from '@/components/ui/form-validation';

export const profileSchema = z.object({
  name: fieldValidations.name(),
  phone: fieldValidations.egyptPhone(),
});

export const passwordSchema = z.object({
  currentPassword: fieldValidations.password(),
  newPassword: fieldValidations.password(),
});

export const teamUserSchema = z.object({
  name: fieldValidations.name(),
  phone: fieldValidations.egyptPhone(),
  password: fieldValidations.password(),
  branchIds: fieldValidations.uuidArray('Assign at least one branch'),
});

export const venueSettingsSchema = z.object({
  type: fieldValidations.select([
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
  name: fieldValidations.localizedDraft().refine((value) => Boolean(value.en || value.ar), {
    message: 'Add an Arabic or English venue name',
  }),
  description: fieldValidations.optionalLocalizedDraft(),
  address: fieldValidations.optionalLocalizedDraft(),
  defaultLocale: fieldValidations.select(['ar', 'en']),
  phone: fieldValidations.optionalEgyptPhone(),
  whatsapp: fieldValidations.optionalEgyptPhone(),
  googleMapsUrl: fieldValidations.url(),
  instagramUrl: fieldValidations.url(),
});

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormValues = z.output<typeof profileSchema>;
export type PasswordFormInput = z.input<typeof passwordSchema>;
export type PasswordFormValues = z.output<typeof passwordSchema>;
export type TeamUserFormInput = z.input<typeof teamUserSchema>;
export type TeamUserFormValues = z.output<typeof teamUserSchema>;
export type VenueSettingsFormInput = z.input<typeof venueSettingsSchema>;
export type VenueSettingsFormValues = z.output<typeof venueSettingsSchema>;
