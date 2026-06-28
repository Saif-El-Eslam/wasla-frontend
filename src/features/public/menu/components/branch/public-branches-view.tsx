'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, GitBranch, MapPin } from 'lucide-react';
import type { PublicBranch, PublicVenue } from '@/lib/api';
import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { textForLocale } from '@/lib/localized-text';

export function PublicBranchesView({
  venue,
  branches,
  locale,
}: {
  venue: PublicVenue;
  branches: PublicBranch[];
  locale: string;
}) {
  const t = useTranslations('public');
  const isRtl = locale === 'ar';
  const venueName = textForLocale(venue.name, locale) || venue.slug;
  const venueDescription = textForLocale(venue.description, locale);
  const cover =
    venue.coverUrl ??
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=600&fit=crop&auto=format';

  useEffect(() => {
    void publicMenuApi.track({ eventType: 'VENUE_VIEW', venueId: venue.id });
  }, [venue.id]);

  return (
    <main className="min-h-dvh bg-[#f8fafa]" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="relative h-[46dvh] min-h-80 overflow-hidden bg-stone-200">
        <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(251,191,36,0.22),transparent_26%),linear-gradient(0deg,rgba(4,47,46,0.84),rgba(4,47,46,0.18))]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between sm:inset-x-8 lg:inset-x-14 xl:inset-x-20">
          <Link
            href={`/${locale}/venues`}
            className="inline-flex h-10 items-center gap-1 rounded-full bg-black/40 px-3 text-xs font-black text-white backdrop-blur"
          >
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            {t('back')}
          </Link>
          <Link
            href={`/${locale === 'ar' ? 'en' : 'ar'}/venues/${venue.slug}/branches`}
            className="inline-flex h-10 items-center rounded-full bg-black/40 px-3 text-xs font-black text-white backdrop-blur"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </Link>
        </div>
        <div className="absolute bottom-8 start-4 flex items-center gap-4 sm:start-8 lg:start-14 xl:start-20">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-teal-600 text-2xl font-black text-white shadow-lg">
            {venue.logoUrl ? <img src={venue.logoUrl} alt="" className="size-full object-cover" /> : venueName.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white sm:text-6xl">{venueName}</h1>
            <span className="mt-1 inline-flex rounded-full bg-black/35 px-2.5 py-1 text-xs font-black text-white backdrop-blur">
              {t(`venueTypes.${venue.type}`)}
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-14 xl:px-20">
        <p className="mb-8 max-w-4xl text-base leading-8 text-muted-foreground">
          {venueDescription || t('chooseBranch')}
        </p>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-stone-800">
          <GitBranch className="size-4 text-teal-600" />
          {t('branchesHeading', { count: branches.length })}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              href={`/${locale}/venues/${venue.slug}/${branch.slug}/menu`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                <MapPin className="size-5 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-black text-stone-900">
                    {textForLocale(branch.name, locale)}
                  </span>
                  {branch.isMain ? (
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-black text-teal-700">
                      {t('mainBranch')}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {textForLocale(branch.address, locale) || t('openMenu')}
                </p>
              </div>
              <span className="text-xs font-black text-teal-700">{t('itemsCount', { count: branch.stats.items })}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
