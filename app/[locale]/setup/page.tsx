'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/api';

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
  const [venueNameEn, setVenueNameEn] = useState('');
  const [venueNameAr, setVenueNameAr] = useState('');
  const [branchNameEn, setBranchNameEn] = useState('');
  const [branchNameAr, setBranchNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [addressAr, setAddressAr] = useState('');

  const setupMutation = useMutation({
    mutationFn: api.setupVenue,
    onSuccess: () => {
      router.push(`/${locale}/dashboard`);
    },
  });

  const error = setupMutation.error instanceof ApiError ? setupMutation.error.message : null;
  const generatedSlug = slugify(venueNameEn || venueNameAr || 'venue');

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
          onSubmit={(event) => {
            event.preventDefault();
            setupMutation.mutate({
              type: 'RESTAURANT',
              name: { en: venueNameEn, ar: venueNameAr },
              slug: generatedSlug,
              defaultLocale: locale === 'ar' ? 'ar' : 'en',
              supportedLocales: ['ar', 'en'],
              phone: phone || undefined,
              whatsapp: whatsapp || undefined,
              address: addressEn || addressAr ? { en: addressEn, ar: addressAr } : undefined,
              branchName: { en: branchNameEn || venueNameEn, ar: branchNameAr || venueNameAr },
              branchSlug: 'main',
            });
          }}
        >
          <input
            className="h-11 rounded-md border border-border px-3"
            value={venueNameEn}
            onChange={(event) => setVenueNameEn(event.target.value)}
            placeholder={t('venueNameEn')}
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={venueNameAr}
            onChange={(event) => setVenueNameAr(event.target.value)}
            placeholder={t('venueNameAr')}
            dir="rtl"
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={branchNameEn}
            onChange={(event) => setBranchNameEn(event.target.value)}
            placeholder={t('branchNameEn')}
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={branchNameAr}
            onChange={(event) => setBranchNameAr(event.target.value)}
            placeholder={t('branchNameAr')}
            dir="rtl"
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('phone')}
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder={t('whatsapp')}
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={addressEn}
            onChange={(event) => setAddressEn(event.target.value)}
            placeholder={t('addressEn')}
          />
          <input
            className="h-11 rounded-md border border-border px-3"
            value={addressAr}
            onChange={(event) => setAddressAr(event.target.value)}
            placeholder={t('addressAr')}
            dir="rtl"
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
