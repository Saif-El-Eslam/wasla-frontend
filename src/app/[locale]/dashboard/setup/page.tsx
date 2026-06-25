'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api';
import { FormInput } from '@/components/ui/form-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  setupSchema,
  type SetupFormInput,
  type SetupFormValues,
} from '@/features/venue/schemas/setup.schema';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SetupPage() {
  const t = useTranslations('setup');
  const commonT = useTranslations('common');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? 'en';
  const form = useForm<SetupFormInput, unknown, SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: { en: '', ar: '' },
      branchName: { en: '', ar: '' },
      phone: '',
      whatsapp: '',
      address: { en: '', ar: '' },
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const setupMutation = useMutation({
    mutationFn: api.setupVenue,
    onSuccess: () => {
      router.push(`/${locale}/dashboard`);
    },
  });

  const error = setupMutation.error instanceof ApiError ? setupMutation.error.message : null;
  const watchedName = watch('name');
  const generatedSlug = slugify(watchedName.en || watchedName.ar || 'venue');
  const onSubmit = (values: SetupFormValues) => {
    const address = {
      en: values.address.en ?? '',
      ar: values.address.ar ?? '',
    };

    setupMutation.mutate({
      type: 'RESTAURANT',
      name: values.name,
      slug: generatedSlug,
      defaultLocale: locale === 'ar' ? 'ar' : 'en',
      supportedLocales: ['ar', 'en'],
      phone: values.phone || undefined,
      whatsapp: values.whatsapp || undefined,
      address: address.en || address.ar ? address : undefined,
      branchName: {
        en: values.branchName.en || values.name.en,
        ar: values.branchName.ar || values.name.ar,
      },
      branchSlug: 'main',
    });
  };

  return (
    <main className="min-h-dvh px-4 py-6">
      <section className="mx-auto w-full max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">{t('phase')}</p>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
          </div>
        </div>

        <form
          className="grid gap-3 rounded-lg border border-border bg-white/88 p-4 shadow-glass backdrop-blur sm:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label={t('nameEn')}
            name="name.en"
            register={register}
            errors={errors}
            placeholder={t('venueNameEn')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('nameAr')}
            name="name.ar"
            register={register}
            errors={errors}
            placeholder={t('venueNameAr')}
            dir="rtl"
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('branchNameEn')}
            name="branchName.en"
            register={register}
            errors={errors}
            placeholder={t('branchNameEn')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('branchNameAr')}
            name="branchName.ar"
            register={register}
            errors={errors}
            placeholder={t('branchNameAr')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('phone')}
            name="phone"
            type="tel"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            register={register}
            errors={errors}
            placeholder={t('phone')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('whatsapp')}
            name="whatsapp"
            type="tel"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            register={register}
            errors={errors}
            placeholder={t('whatsapp')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('addressEn')}
            name="address.en"
            register={register}
            errors={errors}
            placeholder={t('addressEn')}
            className="h-11 rounded-md border border-border px-3"
          />
          <FormInput
            label={t('addressAr')}
            name="address.ar"
            register={register}
            errors={errors}
            placeholder={t('addressAr')}
            className="h-11 rounded-md border border-border px-3"
          />

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm text-muted-foreground">{t('publicSlug', { slug: generatedSlug })}</p>
            {error ? (
              <p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            <button
              className="h-11 w-full rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-60"
              disabled={setupMutation.isPending}
            >
              {setupMutation.isPending ? commonT('saving') : t('createVenue')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
