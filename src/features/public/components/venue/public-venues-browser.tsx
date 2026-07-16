'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, GitBranch, MapPin, Search, SearchX } from 'lucide-react';
import type { PublicVenue, PublicVenueListResponse } from '@/lib/api';
import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { textForLocale } from '@/lib/localized-text';
import { optimizedImageUrl } from '@/lib/image-url';
import { useDebounce } from '@/hooks/use-debounce';
import { useThrottle } from '@/hooks/use-throttle';
import { LogoMark } from '@/components/ui/logo-mark';
import { AppImage } from '@/components/ui/app-image';
import { publicHref } from '@/features/public/utils/public-url';
import { EmptyState } from '@/components/ui/empty-state';

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
      href={publicHref(locale, `venues/${venue.slug}/branches`)}
      className="group block overflow-hidden rounded-2xl border border-border bg-white text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden bg-stone-100">
        <AppImage
          src={optimizedImageUrl(cover, { width: 900, height: 500, crop: 'fill' })}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
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

function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="wasla-venue-skeleton h-40" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="wasla-venue-skeleton h-5 w-2/3 rounded-full" />
            <div className="wasla-venue-skeleton mt-3 h-3 w-full rounded-full" />
            <div className="wasla-venue-skeleton mt-2 h-3 w-4/5 rounded-full" />
          </div>
          <div className="wasla-venue-skeleton h-7 w-12 rounded-lg" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="wasla-venue-skeleton h-4 w-28 rounded-full" />
          <div className="wasla-venue-skeleton h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function VenueSearchActivity({ label }: { label: string }) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
          <Search className="size-4 text-teal-700" />
          <span className="wasla-search-pulse absolute inset-0 rounded-xl border border-teal-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-stone-900">{label}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-teal-50">
            <span className="wasla-search-loader-line block h-full w-1/3 rounded-full bg-teal-500" />
          </div>
        </div>
      </div>
    </div>
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
  const commonT = useTranslations('common');
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [pageState, setPageState] = useState({ source: initialData, pages: [initialData] });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 350);
  const throttledSearch = useThrottle(debouncedSearch, 600);
  const lastRequestedRef = useRef(`${initialSearch.trim()}|${initialType || 'ALL'}`);
  const pages = pageState.source === initialData ? pageState.pages : [initialData];
  const venues = pages.flatMap((page) => page.venues);
  const lastPage = pages[pages.length - 1];
  const searchIsSettling = search.trim() !== throttledSearch;
  const effectiveSearchLoading = searchLoading && pageState.source === initialData;
  const showSearchActivity = searchIsSettling || effectiveSearchLoading;

  const loadNextPage = useCallback(async () => {
    if (!lastPage.pagination.hasNextPage || loadingMore) return;

    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const nextPage = await publicMenuApi.venues({
        page: lastPage.pagination.page + 1,
        limit: lastPage.pagination.limit,
        search: initialSearch,
        type: initialType,
        locale,
      });
      setPageState((current) => ({
        source: initialData,
        pages: current.source === initialData ? [...current.pages, nextPage] : [initialData, nextPage],
      }));
    } catch {
      setLoadMoreFailed(true);
    } finally {
      setLoadingMore(false);
    }
  }, [initialData, initialSearch, initialType, lastPage.pagination, loadingMore, locale]);

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
    setSearchLoading(true);
    router.replace(publicHref(locale, 'venues', params), { scroll: false });
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

      void loadNextPage();
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [lastPage.pagination.hasNextPage, loadNextPage, loadingMore]);

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
    setSearchLoading(true);
    router.push(publicHref(locale, 'venues', params));
  };

  return (
    <main className="min-h-dvh bg-[#f8fafa]">
      <div className="w-full">
        <section className="relative overflow-hidden bg-[#042f2e] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.24),transparent_24%),radial-gradient(circle_at_16%_86%,rgba(45,212,191,0.22),transparent_28%)]" />
          <header className="relative px-4 pb-4 pt-8 sm:px-8 lg:px-14 xl:px-20">
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex flex-col gap-8">
                <Link href={publicHref(locale)} className="flex w-fit items-center gap-2">
                  <LogoMark className="flex size-8 items-center justify-center text-sm font-black text-white" />
                  <span className="text-base font-black text-white">{commonT('wasla')}</span>
                </Link>
                <h1 className="text-4xl font-black text-white sm:text-5xl">{t('discoverVenues')}</h1>
              </div>
              <Link
                href={publicHref(locale === 'ar' ? 'en' : 'ar', 'venues')}
                className="inline-flex h-10 items-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-black text-white backdrop-blur"
              >
                {locale === 'ar' ? 'EN' : 'AR'}
              </Link>
            </div>
          </header>

          <form onSubmit={submitSearch} className="relative px-4 pb-5 sm:px-8 lg:px-14 xl:px-20">
            <Search className="absolute start-8 top-[1.25rem] size-4 text-teal-700 sm:start-12 lg:start-[4.5rem] xl:start-[5.5rem]" />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('venueBrowserSearchPlaceholder')}
              className="h-14 w-full rounded-2xl border border-white/20 bg-white ps-11 pe-4 text-sm font-bold text-stone-900 shadow-2xl shadow-teal-950/20 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-500/20"
            />
          </form>

          <div className="relative flex gap-2 overflow-x-auto px-4 pb-8 sm:px-8 lg:px-14 xl:px-20">
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
                  href={publicHref(locale, 'venues', params)}
                  onClick={() => {
                    if (!active) {
                      setSearchLoading(true);
                    }
                  }}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-black transition ${
                    active
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'border border-white/20 bg-white/10 text-white backdrop-blur'
                  }`}
                >
                  <Filter className="size-3.5" />
                  {t(`venueTypes.${type}`)}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-8 sm:px-8 lg:px-14 xl:px-20">
          {showSearchActivity ? <VenueSearchActivity label={t('searchingVenues')} /> : null}
          <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('venuesCount', { count: lastPage.pagination.total })}
          </div>
          {!effectiveSearchLoading && venues.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon={SearchX} title={t('noVenuesTitle')} body={t('noVenuesBody')} />
            </div>
          ) : <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {effectiveSearchLoading
              ? Array.from({ length: 6 }).map((_, index) => <VenueCardSkeleton key={index} />)
              : venues.map((venue) => <VenueCard key={venue.id} venue={venue} locale={locale} />)}
          </div>}

          <div ref={sentinelRef} className="h-16 py-6 text-center text-sm font-bold text-muted-foreground">
            {loadingMore ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <VenueCardSkeleton key={index} />
                ))}
              </div>
            ) : lastPage.pagination.hasNextPage ? (
              <button
                type="button"
                onClick={() => void loadNextPage()}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-teal-200 bg-white px-5 text-sm font-black text-teal-700 shadow-sm transition hover:bg-teal-50"
              >
                {loadMoreFailed ? commonT('retry') : commonT('loadMore')}
              </button>
            ) : (
              t('endOfVenues')
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
