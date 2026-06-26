import { z } from 'zod';
import { fieldValidations } from '@/components/ui/form-validation';

export const menuFormSchema = z.object({});

export const categoryFormSchema = z
  .object({
    name: fieldValidations.localizedDraft(),
    description: fieldValidations.optionalLocalizedDraft(),
    imageUrl: fieldValidations.url(),
    active: z.boolean(),
  })
  .refine((data) => data.name.en || data.name.ar, {
    message: 'English or Arabic category name is required',
    path: ['name', 'en'],
  });

export const itemFormSchema = z
  .object({
    categoryId: fieldValidations.categoryId(),
    name: fieldValidations.localizedDraft(),
    description: fieldValidations.optionalLocalizedDraft(),
    imageUrl: fieldValidations.url(),
    tags: fieldValidations.tagsText(),
    calories: fieldValidations.optionalNonNegativeInteger(),
    available: z.boolean(),
    priceMode: fieldValidations.select(['single', 'multi']),
    singlePrice: fieldValidations.optionalNonNegativeNumber(),
    prices: z.array(fieldValidations.priceDraft()),
  })
  .refine((data) => data.name.en || data.name.ar, {
    message: 'English or Arabic item name is required',
    path: ['name', 'en'],
  })
  .refine(
    (data) =>
      data.priceMode === 'single'
        ? data.singlePrice !== undefined
        : data.prices.filter((price) => price.label && price.price).length >= 1,
    {
      message: 'At least one price is required',
      path: ['singlePrice'],
    },
  );

export type MenuFormInput = z.input<typeof menuFormSchema>;
export type MenuFormValues = z.output<typeof menuFormSchema>;
export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
export type ItemFormInput = z.input<typeof itemFormSchema>;
export type ItemFormValues = z.output<typeof itemFormSchema>;
