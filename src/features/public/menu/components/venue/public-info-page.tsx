import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Gauge, Home } from 'lucide-react';
import { LogoMark } from '@/components/ui/logo-mark';

type PublicInfoPageKey = 'about' | 'contact' | 'privacy' | 'terms';

export async function PublicInfoPage({ locale, pageKey }: { locale: string; pageKey: PublicInfoPageKey }) {
  const t = await getTranslations({ locale, namespace: 'public' });
  const isRtl = locale === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="min-h-dvh bg-[#f8fafa] text-stone-950">
      <header className="flex items-center justify-between gap-3 px-4 py-5 sm:px-8 lg:px-14 xl:px-20">
        <Link href={`/${locale}`} className="flex items-center gap-2 transition hover:-translate-y-0.5">
          <LogoMark className="flex size-9 items-center justify-center text-lg font-black text-white" />
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

      <section className="wasla-fade-up relative min-h-[calc(100dvh-5rem)] overflow-hidden bg-[#042f2e] px-4 py-16 text-white sm:px-8 lg:px-14 xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(251,191,36,0.2),transparent_26%),radial-gradient(circle_at_16%_84%,rgba(45,212,191,0.2),transparent_28%)]" />
        <div className="relative max-w-4xl">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-black text-white backdrop-blur"
            >
              <BackIcon className="size-4" />
              {t('backToHome')}
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-teal-50 backdrop-blur">
              <Home className="size-4" />
              {t('footerCompany')}
            </div>
          </div>
          <h1 className="mt-4 text-5xl font-black leading-tight text-white sm:text-7xl">
            {t(`${pageKey}Title`)}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">{t(`${pageKey}Body`)}</p>
          <div className="mt-8 border-s-4 border-amber-300 ps-4 text-sm font-bold leading-7 text-white/80">
            {t(`${pageKey}Note`)}
          </div>
        </div>
      </section>
    </main>
  );
}
