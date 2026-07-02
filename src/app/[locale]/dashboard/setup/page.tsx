'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Globe2,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api';
import { FormInput } from '@/components/ui/form-input';
import { LogoMark } from '@/components/ui/logo-mark';
import { cx } from '@/components/ui/cx';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
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
    formState: { errors },
  } = form;

  const setupMutation = useMutation({
    mutationFn: api.setupVenue,
    onSuccess: () => {
      router.push(`/${locale}/dashboard`);
    },
  });

  const error = setupMutation.error instanceof ApiError ? setupMutation.error.message : null;
  const watchedName = useWatch({ control: form.control, name: 'name' }) ?? { en: '', ar: '' };
  const generatedSlug = slugify(watchedName.en || watchedName.ar || 'venue');
  const inputClass =
    'h-12 w-full rounded-2xl border border-teal-100 bg-white px-4 text-sm font-bold text-stone-950 outline-none shadow-sm transition placeholder:text-stone-400 hover:border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const previewName = watchedName.en || watchedName.ar || t('title');
  const previewItems: Array<[string, LucideIcon]> = [
    [t('phone'), Phone],
    [t('whatsapp'), MessageCircle],
    [t('address'), MapPin],
    [t('name'), Globe2],
  ];
  const featureCards: Array<[string, LucideIcon]> = [
    [t('analytics'), BarChart3],
    [t('qrCode'), QrCode],
    [t('googleMaps'), MapPin],
  ];
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
    <main className="relative h-dvh max-h-dvh overflow-hidden bg-[#f8fafa] text-stone-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.96)_0%,rgba(236,253,245,0.78)_48%,rgba(255,251,235,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(13,148,136,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <header className="relative z-10 flex min-h-16 items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-10 xl:px-14">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-2xl px-1 py-1 transition hover:-translate-y-0.5"
        >
          <LogoMark className="flex size-10 items-center justify-center bg-white text-lg font-black text-teal-700 shadow-lg shadow-teal-900/10" />
          <span className="text-lg font-black text-stone-950">Wasla</span>
        </Link>

        <Link
          href={`/${nextLocale}/dashboard/setup`}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-teal-100 bg-white/90 px-3 text-xs font-black text-stone-800 shadow-sm backdrop-blur hover:border-teal-300"
        >
          <Languages className="size-4" />
          {locale === 'ar' ? 'EN' : 'AR'}
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid h-[calc(100dvh-72px)] min-h-0 w-full max-w-7xl gap-6 px-4 pb-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 xl:px-14">
        <aside className="wasla-fade-up relative hidden h-full min-h-0 overflow-hidden rounded-[2rem] bg-[#073b39] p-6 text-white shadow-2xl shadow-teal-950/18 lg:block lg:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_36%),linear-gradient(0deg,rgba(15,23,42,0.28),transparent_62%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:38px_38px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-black text-teal-50 backdrop-blur">
              <Sparkles className="size-3.5 text-amber-300" />
              {t('phase')}
            </div>
            <h1 className="mt-5 max-w-md text-3xl font-black leading-tight sm:text-4xl">{t('title')}</h1>
            {/* <p className="mt-3 max-w-md text-sm leading-7 text-white/72">
              {t('publicSlug', { slug: generatedSlug || 'venue' })}
            </p> */}
          </div>

          <div className="relative mt-8 rounded-[1.6rem] border border-white/14 bg-white/12 p-4 shadow-2xl shadow-black/18 backdrop-blur">
            <div className="rounded-[1.25rem] bg-white p-4 text-stone-950 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-primary">
                    <Store className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-black">{previewName}</p>
                    <p className="mt-1 text-xs font-bold text-stone-500">{generatedSlug || 'venue'}</p>
                  </div>
                </div>
                <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-black text-primary">
                  {locale.toUpperCase()}
                </span>
              </div>

              <div className="mt-5 grid gap-2">
                {previewItems.map(([label, Icon], index) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-3 rounded-2xl border border-teal-50 bg-[#f8fafa] p-3"
                  >
                    <span
                      className={cx(
                        'grid size-9 place-items-center rounded-xl',
                        index === 1 ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-primary',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-black text-stone-700">{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {featureCards.map(([item, Icon], index) => (
              <div
                key={item}
                className={cx(
                  'wasla-owner-card flex w-full items-center gap-4 rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur',
                  index === 1 ? 'wasla-owner-card-2' : index === 2 ? 'wasla-owner-card-3' : '',
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/10 text-amber-300">
                  <Icon className="size-4" />
                </span>
                <p className="text-sm font-black leading-none text-white">{item}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="wasla-fade-up wasla-delay-1 flex h-full min-h-0 items-center overflow-hidden">
          <form
            className="max-h-full w-full overflow-y-auto rounded-[2rem] border border-teal-100 bg-white shadow-2xl shadow-teal-950/12"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="border-b border-teal-50 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_56%,#fffbeb_100%)] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/82 px-3 py-1 text-xs font-black text-teal-700 shadow-sm">
                    <Building2 className="size-3.5" aria-hidden="true" />
                    {t('phase')}
                  </div>
                  <h2 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">
                    {t('title')}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-muted-foreground">
                    {t('publicSlug', { slug: generatedSlug || 'venue' })}
                  </p>
                </div>
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-teal-200">
                  <Building2 className="size-6" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <FormInput
                label={t('nameEn')}
                name="name.en"
                register={register}
                errors={errors}
                placeholder={t('venueNameEn')}
                className={inputClass}
              />
              <FormInput
                label={t('nameAr')}
                name="name.ar"
                register={register}
                errors={errors}
                placeholder={t('venueNameAr')}
                dir="rtl"
                className={inputClass}
              />
              <FormInput
                label={t('branchNameEn')}
                name="branchName.en"
                register={register}
                errors={errors}
                placeholder={t('branchNameEn')}
                className={inputClass}
              />
              <FormInput
                label={t('branchNameAr')}
                name="branchName.ar"
                register={register}
                errors={errors}
                placeholder={t('branchNameAr')}
                dir="rtl"
                className={inputClass}
              />
              <FormInput
                label={t('phone')}
                name="phone"
                type="tel"
                dir="ltr"
                register={register}
                errors={errors}
                placeholder={t('phone')}
                className={inputClass}
              />
              <FormInput
                label={t('whatsapp')}
                name="whatsapp"
                type="tel"
                dir="ltr"
                register={register}
                errors={errors}
                placeholder={t('whatsapp')}
                className={inputClass}
              />
              <FormInput
                label={t('addressEn')}
                name="address.en"
                register={register}
                errors={errors}
                placeholder={t('addressEn')}
                className={inputClass}
              />
              <FormInput
                label={t('addressAr')}
                name="address.ar"
                register={register}
                errors={errors}
                placeholder={t('addressAr')}
                dir="rtl"
                className={inputClass}
              />

              <div className="sm:col-span-2">
                {error ? (
                  <p className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {error}
                  </p>
                ) : null}
                <button
                  className="wasla-shimmer inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white shadow-lg shadow-teal-950/15 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  disabled={setupMutation.isPending}
                >
                  {setupMutation.isPending ? (
                    <span className="inline-flex size-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  {setupMutation.isPending ? commonT('saving') : t('createVenue')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
