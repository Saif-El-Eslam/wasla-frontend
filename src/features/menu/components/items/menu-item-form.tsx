'use client';

import { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormPanel, PrimaryButton, IconButton } from '@/components/ui/dashboard-ui';
import { FormInput } from '@/components/ui/form-input';
import { FormListbox } from '@/components/ui/form-select';
import { FormTextarea } from '@/components/ui/form-textarea';
import type { UseFormReturn, UseFieldArrayRemove, UseFieldArrayAppend } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { ItemFormInput, ItemFormValues } from '@/features/menu/schemas/menu.schema';
import { textForLocale } from '@/lib/localized-text';
import type { MenuCategory } from '@/lib/api';

export function MenuItemForm({
  open,
  title,
  onClose,
  form,
  categories,
  locale,
  onSubmit,
  pending,
  error,
  isEditing,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  form: UseFormReturn<ItemFormInput, unknown, ItemFormValues>;
  categories: MenuCategory[];
  locale: string;
  onSubmit: (values: ItemFormValues) => void;
  pending: boolean;
  error?: unknown;
  isEditing: boolean;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'prices',
  });

  const watchedPriceMode = form.watch('priceMode');
  const effectiveCategoryId = categories.some((category) => category.id === form.watch('categoryId'))
    ? form.watch('categoryId')
    : (categories[0]?.id ?? '');

  useEffect(() => {
    if (effectiveCategoryId && form.getValues('categoryId') !== effectiveCategoryId) {
      form.setValue('categoryId', effectiveCategoryId);
    }
  }, [effectiveCategoryId, form]);

  if (!open) {
    return null;
  }

  return (
    <FormPanel
      title={title}
      closeLabel={commonT('close')}
      onClose={onClose}
      panelClassName="sm:max-w-4xl xl:max-w-5xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormListbox
                name="categoryId"
                control={form.control}
                errors={form.formState.errors}
                disabled={Boolean(isEditing)}
                options={categories.map((category) => ({
                  value: category.id,
                  label: textForLocale(category.name, locale),
                }))}
              />
            </div>
            <FormInput
              name="name.en"
              register={form.register}
              errors={form.formState.errors}
              placeholder={t('itemNameInEnglish')}
            />
            <FormInput
              name="name.ar"
              register={form.register}
              errors={form.formState.errors}
              placeholder={t('itemNameInArabic')}
            />
            <FormTextarea
              name="description.en"
              register={form.register}
              errors={form.formState.errors}
              placeholder={t('descriptionInEnglish')}
            />
            <FormTextarea
              name="description.ar"
              register={form.register}
              errors={form.formState.errors}
              placeholder={t('descriptionInArabic')}
            />
            <div className="sm:col-span-2">
              <FormInput
                name="imageUrl"
                type="url"
                register={form.register}
                errors={form.formState.errors}
                placeholder={t('imageUrl')}
              />
            </div>
            <div className="sm:col-span-2">
              <FormInput
                name="tags"
                register={form.register}
                errors={form.formState.errors}
                placeholder={t('tagsSeparated')}
              />
            </div>
            <FormInput
              name="calories"
              type="number"
              register={form.register}
              errors={form.formState.errors}
              placeholder={t('calories')}
              inputMode="numeric"
            />
            <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
              <input type="checkbox" {...form.register('available')} />
              <span className="truncate">{t('available')}</span>
            </label>
          </div>

          <div className="min-w-0 rounded-2xl border border-border bg-stone-50 p-3">
            <div className="flex flex-row gap-3 items-center justify-between">
              <div>
                <p className="text-sm font-bold text-stone-900">{t('multiLabeledPrices')}</p>
                <p className="text-xs text-muted-foreground">{t('multiLabeledPricesBody')}</p>
              </div>
              <button
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${watchedPriceMode === 'multi' ? 'bg-primary' : 'bg-stone-300'}`}
                onClick={() =>
                  form.setValue('priceMode', watchedPriceMode === 'multi' ? 'single' : 'multi', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                type="button"
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${watchedPriceMode === 'multi' ? 'left-6' : 'left-1'}`}
                />
              </button>
            </div>

            {watchedPriceMode !== 'multi' ? (
              <FormInput
                name="singlePrice"
                register={form.register}
                errors={form.formState.errors}
                placeholder={t('regularPrice')}
                inputMode="decimal"
                className="mt-3 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary"
              />
            ) : (
              <div className="mt-3 space-y-2">
                {fields.map((price, index) => (
                  <div
                    key={price.id}
                    className="grid gap-2 rounded-xl border border-border bg-white p-2 grid-cols-[minmax(3rem,1fr)_minmax(3rem,1fr)_2.5rem] sm:items-start"
                  >
                    <FormInput
                      name={`prices.${index}.label`}
                      register={form.register}
                      errors={form.formState.errors}
                      placeholder={t('label')}
                      className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                    />
                    <FormInput
                      name={`prices.${index}.price`}
                      register={form.register}
                      errors={form.formState.errors}
                      placeholder={t('price')}
                      inputMode="decimal"
                      className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                    />
                    <div className="flex justify-end sm:block">
                      <IconButton
                        label={t('removePrice')}
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
                <button
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary disabled:opacity-50 sm:w-auto"
                  onClick={() => append({ label: '', price: '' })}
                  disabled={fields.length >= 5}
                  type="button"
                >
                  {t('addPriceOption')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
            onClick={onClose}
          >
            {commonT('cancel')}
          </button>
          <PrimaryButton type="submit" loading={pending}>
            <CheckCircle2 className="size-4" />
            {isEditing ? t('saveItem') : t('createItem')}
          </PrimaryButton>
        </div>

        {error ? <p className="mt-2 text-sm text-red-700">{String(error)}</p> : null}
      </form>
    </FormPanel>
  );
}
