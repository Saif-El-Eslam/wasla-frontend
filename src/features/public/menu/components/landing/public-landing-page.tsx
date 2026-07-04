import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  BarChart3,
  Gauge,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  QrCode,
  ReceiptText,
  Sparkles,
  Store,
  TrendingUp,
  UtensilsCrossed,
  WalletCards,
} from 'lucide-react';
import { AuthSessionRedirect } from '@/features/auth/components/auth-session-redirect';
import { LogoMark } from '@/components/ui/logo-mark';
import { AppImage } from '@/components/ui/app-image';
import { PwaInstallSection } from '@/components/shared/pwa-install-section';
import { LandingQuickSearch } from './landing-quick-search';

export async function PublicLandingPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'public' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  const isRtl = locale === 'ar';

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="min-h-dvh overflow-hidden bg-[#f8fafa] text-stone-950">
      <AuthSessionRedirect locale={locale} launchOnly />
      <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-14 xl:px-20">
        <Link href={`/${locale}`} className="flex items-center gap-2 transition hover:-translate-y-0.5">
          <LogoMark className="flex size-9 items-center justify-center text-lg font-black text-white shadow-lg shadow-teal-900/10" />
          <span className="text-lg font-black text-white">{commonT('wasla')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale === 'ar' ? 'en' : 'ar'}`}
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

      <section className="wasla-fade-up relative h-dvh w-full overflow-hidden bg-stone-950 px-4 pb-8 pt-24 text-white sm:px-8 lg:px-14 xl:px-20">
        <AppImage
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&h=1100&fit=crop&auto=format"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_32%,rgba(251,191,36,0.24),transparent_24%),radial-gradient(circle_at_15%_78%,rgba(45,212,191,0.28),transparent_30%),linear-gradient(90deg,rgba(4,47,46,0.96),rgba(4,47,46,0.72),rgba(4,47,46,0.18))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8fafa] to-transparent" />
        <div className="relative grid h-full items-center gap-6 lg:grid-cols-[1.02fr_0.82fr]">
          <div>
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-sm backdrop-blur">
              <UtensilsCrossed className="size-4" />
              {t('landingBadge')}
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-white sm:text-6xl lg:text-6xl xl:text-7xl">
              {t('landingTitle')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{t('landingBody')}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/register`}
                className="wasla-shimmer inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-black text-white shadow-lg shadow-teal-950/25"
              >
                <PlusCircle className="size-4" />
                {t('addYourVenue')}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/${locale}/venues`}
                className="z-9 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-5 text-sm font-black text-white shadow-sm backdrop-blur hover:bg-white/20"
              >
                <Store className="size-4" />
                {t('browseVenues')}
              </Link>
            </div>
            {/* <div className="mt-4 inline-flex max-w-xl items-center gap-2 rounded-2xl border border-white/18 bg-white/12 px-3 py-2 text-xs font-bold leading-5 text-white/82 shadow-sm backdrop-blur sm:text-sm">
              <WalletCards className="size-4 shrink-0 text-amber-200" />
              <span>{t('landingFinanceHeroTag')}</span>
            </div> */}
            <div className="mt-16 hidden max-w-2xl flex-nowrap gap-2 lg:flex">
              {[
                [t('5min'), t('landingStatPublish')],
                [t('24/7'), t('landingStatAccess')],
                [t('QR'), t('landingStatQr')],
                [t('financeialSpace'), t('trackIncomeAndExpenses')],
              ].map(([value, label], index) => (
                <div
                  key={value}
                  className={`wasla-owner-card-horizontal wasla-owner-card-${index + 1} hover:bg-white/20 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur`}
                >
                  <div className="text-lg font-black text-white">{value}</div>
                  <div className="mt-1 text-[11px] font-bold text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-48 sm:min-h-[300px] lg:min-h-[420px]">
            <div className="wasla-orbit absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:size-72 lg:size-80" />
            <div className="wasla-hero-tile wasla-hero-tile-1 absolute end-2 top-4 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur sm:end-8 sm:top-8 sm:rounded-3xl sm:p-5 lg:end-10 lg:top-10">
              <QrCode className="size-6 text-amber-200 sm:size-8" />
              <p className="mt-2 text-xs font-black sm:mt-3 sm:text-sm">{t('landingStatQr')}</p>
            </div>
            <div className="wasla-hero-tile wasla-hero-tile-2 absolute start-1 top-28 max-w-36 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur sm:start-4 sm:top-36 sm:max-w-none sm:rounded-3xl sm:p-5">
              <BarChart3 className="size-6 text-teal-200 sm:size-8" />
              <p className="mt-2 text-xs font-black sm:mt-3 sm:text-sm">{t('landingOwnerAnalyticsTitle')}</p>
            </div>
            <div className="wasla-hero-tile wasla-hero-tile-3 absolute bottom-4 end-8 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur sm:bottom-8 sm:end-20 sm:rounded-3xl sm:p-5">
              <Store className="size-6 text-white sm:size-8" />
              <p className="mt-2 text-xs font-black sm:mt-3 sm:text-sm">{t('browseVenues')}</p>
            </div>
            <div className="wasla-hero-tile wasla-hero-tile-4 absolute top-8 start-8 rounded-2xl border border-white/18 bg-white/14 p-4 shadow-2xl backdrop-blur sm:top-16 sm:start-20 sm:rounded-3xl sm:p-5">
              <WalletCards className="size-6 text-amber-200 sm:size-8" />
              <p className="mt-2 text-xs font-black sm:mt-3 sm:text-sm">{t('landingFinanceHeroTag')}</p>
            </div>
          </div>
        </div>
        <div className="wasla-float absolute bottom-5 end-5 hidden w-56 border border-white/20 bg-white/15 p-3 text-white shadow-2xl backdrop-blur lg:block">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300 text-stone-950">
              <Sparkles className="size-5" />
            </div>

            <div>
              <p className="text-sm font-black">{t('landingLivePreviewTitle')}</p>
              <p className="text-xs font-bold text-white/70">{t('landingLivePreviewBody')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#ecfdf8]">
        <LandingQuickSearch locale={locale} />
      </section>

      <section className="wasla-fade-up wasla-delay-1 relative grid min-h-dvh w-full items-center gap-10 overflow-hidden bg-[#062f2d] px-4 py-16 text-white sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-14 xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(251,191,36,0.22),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(45,212,191,0.22),transparent_28%)]" />
        <div>
          <div className="relative mb-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-stone-950">
            <Sparkles className="size-4" />
            {t('landingWowEyebrow')}
          </div>
          <h2 className="relative max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            {t('landingWowTitle')}
          </h2>
          <p className="relative mt-4 max-w-xl text-sm leading-7 text-white/75">{t('landingWowBody')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/register`}
              className="z-10 wasla-shimmer inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-lg shadow-teal-950/15"
            >
              <PlusCircle className="size-4" />
              {t('addYourVenue')}
            </Link>
            <Link
              href={`/${locale}/venues`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white shadow-sm backdrop-blur"
            >
              <Store className="size-4" />
              {t('browseVenues')}
            </Link>
          </div>
        </div>

        <div className="wasla-wow-stage relative min-h-[450px] overflow-visible px-1 py-5 text-white sm:min-h-[500px] sm:px-5 lg:min-h-[550px]">
          <div className="absolute inset-x-0 top-0 rounded-t-2xl h-16 bg-[linear-gradient(180deg,rgba(45,212,191,0.2),transparent)]" />
          <div className="wasla-wow-phone relative mx-auto h-[360px] w-full max-w-[250px] rounded-[2rem] border border-white/18 bg-stone-950 p-2 shadow-2xl sm:h-[440px] sm:max-w-[310px] sm:p-3">
            <div className="h-full overflow-hidden rounded-[1.45rem] bg-[#f8fafa] text-stone-950">
              <div className="relative h-28 overflow-hidden bg-stone-900">
                <AppImage
                  src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&h=500&fit=crop&auto=format"
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover opacity-[0.82]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-transparent" />
                <div className="absolute bottom-3 start-3">
                  <div className="text-lg font-black text-white">{t('landingWowVenue')}</div>
                  <div className="mt-1 text-xs font-bold text-white/70">{t('landingWowBranch')}</div>
                </div>
              </div>

              <div className="px-3 py-3">
                <div className="flex gap-2 overflow-hidden">
                  {[t('landingWowCategory1'), t('landingWowCategory2'), t('landingWowCategory3')].map(
                    (label) => (
                      <span
                        key={label}
                        className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`wasla-menu-card wasla-menu-card-${item} flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2 shadow-sm`}
                    >
                      <div className="size-12 rounded-xl bg-[linear-gradient(135deg,#ccfbf1,#fde68a)]" />
                      <div className="min-w-0 flex-1">
                        <div className="h-3 w-28 rounded-full bg-stone-900" />
                        <div className="mt-2 h-2 w-20 rounded-full bg-stone-200" />
                      </div>
                      <div className="h-6 w-12 rounded-full bg-teal-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="wasla-qr-card absolute start-0 top-6 origin-top-left scale-[0.78] rounded-2xl border border-white/18 bg-white p-3 text-stone-950 shadow-xl sm:start-4 sm:top-8 sm:scale-100">
            <div className="relative grid size-24 grid-cols-4 gap-1 overflow-hidden rounded-lg bg-white p-2">
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-sm ${[0, 1, 4, 5, 10, 11, 14].includes(index) ? 'bg-stone-950' : 'bg-teal-100'}`}
                />
              ))}
              <span className="wasla-scan-line absolute inset-x-1 h-1 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.95)]" />
            </div>
            <div className="mt-2 text-xs font-black text-teal-700">{t('landingWowScan')}</div>
          </div>

          <div className="wasla-action-chip wasla-action-chip-1 absolute end-0 top-20 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-black text-stone-900 shadow-xl sm:end-4 sm:top-16 sm:text-xs">
            <MessageCircle className="size-4 text-teal-600" />
            {t('landingIntentWhatsapp')}
          </div>
          <div className="wasla-action-chip wasla-action-chip-2 absolute bottom-20 start-0 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-black text-stone-900 shadow-xl sm:bottom-24 sm:start-5 sm:text-xs">
            <MapPin className="size-4 text-teal-600" />
            {t('landingIntentMaps')}
          </div>
          <div className="wasla-action-chip wasla-action-chip-3 absolute bottom-5 end-2 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-[11px] font-black text-stone-950 shadow-xl sm:bottom-8 sm:end-8 sm:text-xs">
            <Phone className="size-4" />
            {t('landingIntentCalls')}
          </div>
        </div>
      </section>

      <section className="wasla-fade-up wasla-delay-1 relative grid min-h-dvh w-full items-center gap-10 overflow-hidden bg-[#f8fafa] px-4 py-16 text-stone-950 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-14 xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(251,191,36,0.22),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(20,184,166,0.16),transparent_28%)]" />

        <div>
          <div className="relative mb-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-stone-950">
            <WalletCards className="size-4" />
            {t('landingFinanceEyebrow')}
          </div>

          <h2 className="relative max-w-2xl text-3xl font-black leading-tight text-stone-950 sm:text-4xl lg:text-5xl">
            {t('landingFinanceTitle')}
          </h2>

          <p className="relative mt-4 max-w-xl text-sm leading-7 text-stone-600">{t('landingFinanceBody')}</p>

          <div className="hidden lg:grid relative mt-7 gap-3 sm:grid-cols-3">
            {[
              {
                Icon: ReceiptText,
                title: t('landingFinanceDailyTitle'),
                body: t('landingFinanceDailyBody'),
              },
              {
                Icon: Store,
                title: t('landingFinanceBranchTitle'),
                body: t('landingFinanceBranchBody'),
              },
              {
                Icon: TrendingUp,
                title: t('landingFinanceReportsTitle'),
                body: t('landingFinanceReportsBody'),
              },
            ].map(({ Icon, title, body }, index) => (
              <div
                key={title}
                className={`wasla-owner-card-horizontal wasla-owner-card-${index + 1} rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur`}
              >
                <Icon className="size-5 text-teal-600" />
                <h3 className="mt-3 text-sm font-black text-stone-950">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[450px] overflow-visible px-1 py-5 sm:min-h-[500px] sm:px-5 lg:min-h-[550px]">
          <div className="absolute inset-x-0 top-0 rounded-t-2xl h-16 bg-[linear-gradient(180deg,rgba(20,184,166,0.16),transparent)]" />

          <div className="relative mx-auto max-w-2xl rounded-[1.75rem] border border-stone-200 bg-white/80 p-3 shadow-2xl shadow-teal-950/10 backdrop-blur">
            <div className="rounded-[1.35rem] bg-white p-4 text-stone-950 shadow-xl sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-teal-700">
                    {t('landingFinancePanelEyebrow')}
                  </p>
                  <h3 className="mt-1 text-xl font-black">{t('landingFinancePanelTitle')}</h3>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
                  {t('landingFinancePanelRange')}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  [t('landingFinanceIncome'), '6,450 EGP', 'text-emerald-700'],
                  [t('landingFinanceExpenses'), '5,000 EGP', 'text-red-700'],
                  [t('landingFinanceNet'), '1,450 EGP', 'text-teal-700'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-xl border border-stone-200 bg-[#f8fafa] p-3 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-normal text-stone-500">{label}</p>
                    <p className={`mt-2 text-sm font-black sm:text-lg ${tone}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-xl border border-stone-200 bg-[#f8fafa] p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">{t('landingFinanceQuickEntry')}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                      {t('landingFinanceIncome')}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {[
                      [t('landingFinanceCategoryOne'), 'bg-teal-200', null],
                      [t('landingFinanceMethodOne'), 'bg-teal-200', 'true'],
                      [t('landingFinanceExpenseLine'), 'bg-red-200', 'true'],
                    ].map(([item, tone, showInSmall]) => (
                      <div
                        key={item}
                        className={`${showInSmall ? 'flex' : 'hidden'} md:flex items-center justify-between rounded-lg bg-white px-3 py-2`}
                      >
                        <span className="text-xs font-bold text-stone-500">{item}</span>
                        <span className={`h-2 w-16 rounded-full ${tone}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-[#f8fafa] p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">{t('landingFinanceBranchReport')}</p>
                    <TrendingUp className="size-4 text-teal-600" />
                  </div>

                  <div className="mt-3 space-y-2">
                    {[
                      [t('landingFinanceBranchOne'), '1,450 EGP', 'bg-teal-50 text-teal-700', null],
                      [t('landingFinanceBranchTwo'), '780 EGP', 'bg-emerald-50 text-emerald-700', 'true'],
                      [t('landingFinanceBranchThree'), '520 EGP', 'bg-red-50 text-red-700', 'true'],
                    ].map(([label, value, tone, showInSmall]) => (
                      <div
                        key={label}
                        className={`${showInSmall ? 'flex' : 'hidden'} md:flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2`}
                      >
                        <span className="text-xs font-black text-stone-700">{label}</span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-black ${tone}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="wasla-action-chip wasla-action-chip-1 absolute end-0 top-24 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-[11px] font-black text-stone-900 shadow-xl sm:end-4 sm:top-24 sm:text-xs">
            <TrendingUp className="size-4 text-teal-600" />
            {t('landingFinanceReportsTitle')}
          </div>

          <div className="wasla-action-chip wasla-action-chip-2 absolute bottom-24 start-0 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-black text-stone-900 shadow-xl sm:bottom-20 sm:start-5 sm:text-xs">
            <Store className="size-4 text-teal-600" />
            {t('landingFinanceBranchTitle')}
          </div>

          <div className="wasla-action-chip wasla-action-chip-3 absolute bottom-6 end-2 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-[11px] font-black text-stone-950 shadow-xl sm:bottom-8 sm:end-8 sm:text-xs">
            <WalletCards className="size-4" />
            {t('landingFinanceNet')}
          </div>
        </div>
      </section>

      <PwaInstallSection variant="landing" />

      <section className="wasla-fade-up wasla-delay-2 w-full overflow-hidden bg-white px-4 py-20 text-stone-950 sm:px-8 lg:px-14 xl:px-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
              <QrCode className="size-4" />
              {t('landingOwnerEyebrow')}
            </div>
            <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              {t('landingOwnerTitle')}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{t('landingOwnerBody')}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/register`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#042f2e] px-5 text-sm font-black text-white shadow-lg shadow-teal-950/10"
              >
                <PlusCircle className="size-4" />
                {t('addYourVenue')}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-black text-stone-800 shadow-sm"
              >
                <Gauge className="size-4" />
                {t('openDashboard')}
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { Icon: QrCode, title: t('landingOwnerQrTitle'), body: t('landingOwnerQrBody') },
              {
                Icon: BarChart3,
                title: t('landingOwnerAnalyticsTitle'),
                body: t('landingOwnerAnalyticsBody'),
              },
              { Icon: Store, title: t('landingOwnerBranchesTitle'), body: t('landingOwnerBranchesBody') },
              { Icon: UtensilsCrossed, title: t('landingOwnerMenuTitle'), body: t('landingOwnerMenuBody') },
            ].map(({ Icon, title, body }, index) => (
              <div
                key={title}
                className={`wasla-owner-card wasla-owner-card-${index + 1} wasla-tilt-card rounded-xl border border-border bg-[#f8fafa] p-4 shadow-sm`}
              >
                <Icon className="size-5 text-teal-600" />
                <h3 className="mt-3 text-sm font-black text-stone-950">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white px-4 py-8 sm:px-8 lg:px-14 xl:px-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/${locale}`} className="flex w-fit items-center gap-2">
            <LogoMark className="flex size-8 items-center justify-center text-sm font-black text-white" />
            <span className="text-base font-black text-teal-700">{commonT('wasla')}</span>
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
            {[
              ['about', t('footerAbout')],
              ['contact', t('footerContact')],
              ['privacy', t('footerPrivacy')],
              ['terms', t('footerTerms')],
            ].map(([href, label]) => (
              <Link key={href} href={`/${locale}/${href}`} className="hover:text-teal-700">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-4 text-xs font-bold text-muted-foreground">{t('footerRights')}</p>
      </footer>
    </main>
  );
}
