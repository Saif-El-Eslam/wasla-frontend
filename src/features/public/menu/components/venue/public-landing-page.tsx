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
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { LandingQuickSearch } from './landing-quick-search';

export async function PublicLandingPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'public' });
  const isRtl = locale === 'ar';

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-dvh overflow-hidden bg-[#f8fafa] text-stone-950"
    >
      <div className="mx-auto max-w-6xl px-4 py-5">
        <header className="relative z-20 flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-2 transition hover:-translate-y-0.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-black text-white shadow-lg shadow-teal-900/10">
              W
            </div>
            <span className="text-lg font-black text-teal-700">Wasla</span>
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

        <section className="wasla-fade-up relative mt-5 min-h-[74dvh] overflow-hidden rounded-2xl bg-stone-950 px-4 py-10 text-white shadow-2xl shadow-teal-950/20 sm:px-8 lg:px-10">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&h=1100&fit=crop&auto=format"
            alt=""
            className="absolute inset-0 size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,47,46,0.94),rgba(4,47,46,0.62),rgba(4,47,46,0.12))]" />
          <div className="relative flex min-h-[calc(74dvh-5rem)] max-w-3xl flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-sm backdrop-blur">
              <UtensilsCrossed className="size-4" />
              {t('landingBadge')}
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              {t('landingTitle')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {t('landingBody')}
            </p>
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-5 text-sm font-black text-white shadow-sm backdrop-blur hover:bg-white/20"
              >
                <Store className="size-4" />
                {t('browseVenues')}
              </Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-2">
              {[
                ['128+', t('landingStatMenus')],
                ['24/7', t('landingStatAccess')],
                ['QR', t('landingStatQr')],
              ].map(([value, label]) => (
                <div key={value} className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <div className="text-lg font-black text-white">{value}</div>
                  <div className="mt-1 text-[11px] font-bold text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="wasla-float absolute bottom-5 end-5 hidden w-56 rounded-2xl border border-white/20 bg-white/15 p-3 text-white shadow-2xl backdrop-blur lg:block">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-300 text-stone-950">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-black">{t('landingLivePreviewTitle')}</p>
                <p className="text-xs font-bold text-white/70">{t('landingLivePreviewBody')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wasla-fade-up wasla-delay-1 grid items-center gap-8 py-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700">
              <Sparkles className="size-4" />
              {t('landingWowEyebrow')}
            </div>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-stone-950 sm:text-5xl">
              {t('landingWowTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {t('landingWowBody')}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/register`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#042f2e] px-5 text-sm font-black text-white shadow-lg shadow-teal-950/15"
              >
                <PlusCircle className="size-4" />
                {t('addYourVenue')}
              </Link>
              <Link
                href={`/${locale}/venues`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-black text-stone-800 shadow-sm"
              >
                <Store className="size-4" />
                {t('browseVenues')}
              </Link>
            </div>
          </div>

          <div className="wasla-wow-stage relative min-h-[480px] overflow-hidden rounded-2xl border border-teal-900/10 bg-[#062f2d] p-5 text-white shadow-2xl shadow-teal-950/20">
            <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(45,212,191,0.2),transparent)]" />
            <div className="wasla-wow-phone relative mx-auto h-[440px] w-full max-w-[310px] rounded-[2rem] border border-white/18 bg-stone-950 p-3 shadow-2xl">
              <div className="h-full overflow-hidden rounded-[1.45rem] bg-[#f8fafa] text-stone-950">
                <div className="relative h-28 overflow-hidden bg-stone-900">
                  <img
                    src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&h=500&fit=crop&auto=format"
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-[0.82]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-transparent" />
                  <div className="absolute bottom-3 start-3">
                    <div className="text-lg font-black text-white">{t('landingWowVenue')}</div>
                    <div className="mt-1 text-xs font-bold text-white/70">{t('landingWowBranch')}</div>
                  </div>
                </div>

                <div className="px-3 py-3">
                  <div className="flex gap-2 overflow-hidden">
                    {[t('landingWowCategory1'), t('landingWowCategory2'), t('landingWowCategory3')].map((label) => (
                      <span key={label} className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700">
                        {label}
                      </span>
                    ))}
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

            <div className="wasla-qr-card absolute start-4 top-8 rounded-2xl border border-white/18 bg-white p-3 text-stone-950 shadow-xl">
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

            <div className="wasla-action-chip wasla-action-chip-1 absolute end-4 top-16 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-900 shadow-xl">
              <MessageCircle className="size-4 text-teal-600" />
              {t('landingIntentWhatsapp')}
            </div>
            <div className="wasla-action-chip wasla-action-chip-2 absolute bottom-24 start-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-900 shadow-xl">
              <MapPin className="size-4 text-teal-600" />
              {t('landingIntentMaps')}
            </div>
            <div className="wasla-action-chip wasla-action-chip-3 absolute bottom-8 end-8 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-xs font-black text-stone-950 shadow-xl">
              <Phone className="size-4" />
              {t('landingIntentCalls')}
            </div>
          </div>
        </section>

        <section className="grid items-center gap-6 py-12 lg:grid-cols-[0.92fr_1.08fr]">
          <LandingQuickSearch locale={locale} />
          <div className="wasla-fade-up wasla-delay-1 grid gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              <Sparkles className="size-4" />
              {t('landingSectionMenusEyebrow')}
            </div>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
              {t('landingSectionMenusTitle')}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {t('landingSectionMenusBody')}
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {[
                { Icon: MapPin, label: t('landingIntentMaps') },
                { Icon: MessageCircle, label: t('landingIntentWhatsapp') },
                { Icon: Phone, label: t('landingIntentCalls') },
              ].map(({ Icon, label }) => (
                <div key={label} className="wasla-tilt-card rounded-xl border border-border bg-white p-4 shadow-sm">
                  <Icon className="size-5 text-teal-600" />
                  <div className="mt-3 text-sm font-black text-stone-900">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wasla-fade-up wasla-delay-2 mb-8 overflow-hidden rounded-2xl bg-[#042f2e] px-4 py-8 text-white shadow-2xl shadow-teal-950/15 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black text-teal-50">
                <QrCode className="size-4" />
                {t('landingOwnerEyebrow')}
              </div>
              <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                {t('landingOwnerTitle')}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                {t('landingOwnerBody')}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/register`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#042f2e] shadow-lg"
                >
                  <PlusCircle className="size-4" />
                  {t('addYourVenue')}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white backdrop-blur"
                >
                  <Gauge className="size-4" />
                  {t('openDashboard')}
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { Icon: QrCode, title: t('landingOwnerQrTitle'), body: t('landingOwnerQrBody') },
                { Icon: BarChart3, title: t('landingOwnerAnalyticsTitle'), body: t('landingOwnerAnalyticsBody') },
                { Icon: Store, title: t('landingOwnerBranchesTitle'), body: t('landingOwnerBranchesBody') },
                { Icon: UtensilsCrossed, title: t('landingOwnerMenuTitle'), body: t('landingOwnerMenuBody') },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="wasla-tilt-card rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <Icon className="size-5 text-teal-200" />
                  <h3 className="mt-3 text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/${locale}`} className="flex w-fit items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-teal-600 text-sm font-black text-white">
                W
              </div>
              <span className="text-base font-black text-teal-700">Wasla</span>
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
      </div>
    </main>
  );
}
