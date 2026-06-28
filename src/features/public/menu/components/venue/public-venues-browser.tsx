'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, GitBranch, MapPin, Search, Star } from 'lucide-react';
import type { PublicVenue, PublicVenueListResponse } from '@/lib/api';
import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { textForLocale } from '@/lib/localized-text';
import { useDebounce } from '@/hooks/use-debounce';
import { useThrottle } from '@/hooks/use-throttle';

const venueTypes = [
  'ALL',
  'RESTAURANT',
  'CAFE',
  'BAKERY',
  'DESSERT_SHOP',
  'FOOD_TRUCK',
  'CLOUD_KITCHEN',
  'LOUNGE',
];

function VenueCard({ venue, locale }: { venue: PublicVenue; locale: string }) {
  const t = useTranslations('public');
  const name = textForLocale(venue.name, locale) || venue.slug;
  const description = textForLocale(venue.description, locale) || textForLocale(venue.address, locale);
  const cover =
    venue.coverUrl ??
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=500&fit=crop&auto=format';

  return (
    <Link
      href={`/${locale}/venues/${venue.slug}/branches`}
      className="group block overflow-hidden rounded-2xl border border-border bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden bg-stone-100">
        <img src={cover} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-3 start-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            {t(`venueTypes.${venue.type}`)}
          </span>
          {textForLocale(venue.address, locale) ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
              <MapPin className="size-3" />
              {textForLocale(venue.address, locale)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-stone-950">{name}</h2>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {description || t('fallbackVenueDescription')}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-600">
            <Star className="size-3" fill="currentColor" />
            4.8
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="size-3.5" />
            {t('branchesCount', { count: venue.branchCount })}
          </span>
          <span className="ms-auto text-teal-700">{t('viewBranches')}</span>
        </div>
      </div>
    </Link>
  );
}

export function PublicVenuesBrowser({
  initialData,
  locale,
  initialSearch,
  initialType,
}: {
  initialData: PublicVenueListResponse;
  locale: string;
  initialSearch: string;
  initialType: string;
}) {
  const t = useTranslations('public');
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [pages, setPages] = useState([initialData]);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 350);
  const throttledSearch = useThrottle(debouncedSearch, 600);
  const lastRequestedRef = useRef(`${initialSearch.trim()}|${initialType || 'ALL'}`);
  const venues = pages.flatMap((page) => page.venues);
  const lastPage = pages[pages.length - 1];

  useEffect(() => {
    if (document.activeElement !== searchInputRef.current) {
      setSearch(initialSearch);
    }
    setPages([initialData]);
    lastRequestedRef.current = `${initialSearch.trim()}|${initialType || 'ALL'}`;
  }, [initialData, initialSearch, initialType]);

  useEffect(() => {
    const nextType = initialType || 'ALL';
    const nextSignature = `${throttledSearch}|${nextType}`;

    if (nextSignature === lastRequestedRef.current) {
      return;
    }

    const params = new URLSearchParams();
    if (throttledSearch) {
      params.set('search', throttledSearch);
    }
    if (nextType !== 'ALL') {
      params.set('type', nextType);
    }

    lastRequestedRef.current = nextSignature;
    router.replace(`/${locale}/venues${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [initialType, locale, router, throttledSearch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !lastPage.pagination.hasNextPage || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) {
        return;
      }

      setLoadingMore(true);
      publicMenuApi
        .venues({
          page: lastPage.pagination.page + 1,
          limit: lastPage.pagination.limit,
          search: initialSearch,
          type: initialType,
        })
        .then((nextPage) => setPages((current) => [...current, nextPage]))
        .finally(() => setLoadingMore(false));
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [initialSearch, initialType, lastPage.pagination, loadingMore]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (initialType && initialType !== 'ALL') {
      params.set('type', initialType);
    }
    lastRequestedRef.current = `${search.trim()}|${initialType || 'ALL'}`;
    router.push(`/${locale}/venues${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <main className="min-h-dvh bg-[#f8fafa] px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <Link href={`/${locale}`} className="mb-1 flex w-fit items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-teal-600 text-sm font-black text-white">
                W
              </div>
              <span className="text-base font-black text-teal-700">Wasla</span>
            </Link>
            <h1 className="text-2xl font-black text-stone-950">{t('discoverVenues')}</h1>
          </div>
          <Link
            href={`/${locale === 'ar' ? 'en' : 'ar'}/venues`}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-700"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </Link>
        </header>

        <form onSubmit={submitSearch} className="relative">
          <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('venueBrowserSearchPlaceholder')}
            className="h-12 w-full rounded-xl border border-border bg-white ps-10 pe-4 text-sm font-medium outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
          />
        </form>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {venueTypes.map((type) => {
            const params = new URLSearchParams();
            if (search.trim()) {
              params.set('search', search.trim());
            }
            if (type !== 'ALL') {
              params.set('type', type);
            }
            const active = (initialType || 'ALL') === type;

            return (
              <Link
                key={type}
                href={`/${locale}/venues${params.toString() ? `?${params.toString()}` : ''}`}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-black transition ${
                  active ? 'bg-teal-600 text-white shadow-md' : 'border border-border bg-white text-stone-700'
                }`}
              >
                <Filter className="size-3.5" />
                {t(`venueTypes.${type}`)}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('venuesCount', { count: lastPage.pagination.total })}
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} locale={locale} />
          ))}
        </div>

        <div ref={sentinelRef} className="h-16 py-6 text-center text-sm font-bold text-muted-foreground">
          {loadingMore ? t('loadingMoreVenues') : lastPage.pagination.hasNextPage ? '' : t('endOfVenues')}
        </div>
      </div>
    </main>
  );
}
