'use client';

import Link from 'next/link';
import { MapPinOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LocalizedNotFound() {
  const t = useTranslations('errors');
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === 'ar' ? 'ar' : 'en';

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="w-full max-w-lg rounded-[2rem] border border-teal-100 bg-white p-7 text-center shadow-xl shadow-teal-950/5">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <MapPinOff className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-stone-950">{t('notFoundTitle')}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t('notFoundBody')}</p>
        <Link className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-black text-white" href={`/${locale}`}>
          {t('home')}
        </Link>
      </section>
    </main>
  );
}
