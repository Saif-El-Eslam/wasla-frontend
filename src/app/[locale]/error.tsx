'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LocalizedError() {
  const t = useTranslations('errors');
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === 'ar' ? 'ar' : 'en';

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="w-full max-w-lg rounded-[2rem] border border-amber-100 bg-white p-7 text-center shadow-xl shadow-amber-950/5">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-stone-950">{t('unexpectedTitle')}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t('unexpectedBody')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-white">
            <RotateCcw className="size-4" aria-hidden="true" />
            {t('tryAgain')}
          </button>
          <Link className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-black text-stone-700" href={`/${locale}`}>
            {t('home')}
          </Link>
        </div>
      </section>
    </main>
  );
}
