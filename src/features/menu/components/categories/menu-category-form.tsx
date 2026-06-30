'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormPanel, PrimaryButton } from '@/components/ui/dashboard-ui';
import { FormInput } from '@/components/ui/form-input';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import type { UseFormReturn } from 'react-hook-form';
import type { CategoryFormInput, CategoryFormValues } from '@/features/menu/schemas/menu.schema';

export function MenuCategoryForm({
  open,
  title,
  onClose,
  form,
  onSubmit,
  imageFile = null,
  onImageFileChange = () => undefined,
  pending,
  error,
  isEditing,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  form: UseFormReturn<CategoryFormInput, unknown, CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => void;
  imageFile?: File | null;
  onImageFileChange?: (file: File | null) => void;
  pending: boolean;
  error?: unknown;
  isEditing: boolean;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');

  if (!open) {
    return null;
  }

  return (
    <FormPanel
      title={title}
      closeLabel={commonT('close')}
      onClose={onClose}
      panelClassName="sm:max-w-xl xl:max-w-2xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput
            name="name.en"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('categoryNameInEnglish')}
          />
          <FormInput
            name="name.ar"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('categoryNameInArabic')}
          />
          <FormInput
            name="description.en"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('descriptionInEnglish')}
          />
          <FormInput
            name="description.ar"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('descriptionInArabic')}
          />
          <div className="sm:col-span-2">
              <ImageUploadField
                label={t('categoryImageUrl')}
                value={(form.watch('imageUrl') as string) ?? ''}
                file={imageFile}
                onFileChange={onImageFileChange}
                onChange={(value) => form.setValue('imageUrl', value, { shouldDirty: true, shouldValidate: true })}
                aspect="aspect-[5/2]"
                disabled={pending}
                pending={pending}
              />
          </div>
        </div>

        <div className="flex mt-4 gap-2 justify-end">
          <button
            type="button"
            className="ms-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
            onClick={onClose}
          >
            {commonT('cancel')}
          </button>
          <PrimaryButton type="submit" loading={pending}>
            <CheckCircle2 className="size-4" />
            {isEditing ? t('saveCategory') : t('createCategory')}
          </PrimaryButton>
        </div>

        {error ? <p className="mt-2 text-sm text-red-700">{String(error)}</p> : null}
      </form>
    </FormPanel>
  );
}
