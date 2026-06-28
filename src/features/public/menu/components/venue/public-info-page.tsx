import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Gauge, Home } from 'lucide-react';

type PublicInfoPageKey = 'about' | 'contact' | 'privacy' | 'terms';

export async function PublicInfoPage({ locale, pageKey }: { locale: string; pageKey: PublicInfoPageKey }) {
  const t = await getTranslations({ locale, namespace: 'public' });
  const isRtl = locale === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="min-h-dvh bg-[#f8fafa] px-4 py-5 text-stone-950">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-2 transition hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-black text-white">
              W
            </div>
            <span className="text-lg font-black text-teal-700">Wasla</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale === 'ar' ? 'en' : 'ar'}/${pageKey}`}
              className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-700 shadow-sm"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#042f2e] px-4 text-xs font-black text-white shadow-sm"
            >
              <Gauge className="size-4" />
              {t('dashboard')}
            </Link>
          </div>
        </header>

        <section className="wasla-fade-up mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-700"
          >
            <BackIcon className="size-4" />
            {t('backToHome')}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
            <Home className="size-4" />
            {t('footerCompany')}
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
            {t(`${pageKey}Title`)}
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">{t(`${pageKey}Body`)}</p>
          <div className="mt-6 rounded-xl bg-stone-50 p-4 text-sm font-bold leading-7 text-stone-700">
            {t(`${pageKey}Note`)}
          </div>
        </section>
      </div>
    </main>
  );
}
