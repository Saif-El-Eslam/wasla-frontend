'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FocusEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, GitBranch, Loader2, Search, Store } from 'lucide-react';
import type { LocalizedValue, PublicBranch, PublicVenue } from '@/lib/api';
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
  'CATERING',
  'LOUNGE',
  'OTHER',
];

function allLocalizedValues(value: LocalizedValue | null | undefined) {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  return Object.values(value).filter(Boolean);
}

function branchMatchesSearch(branch: PublicBranch, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [branch.slug, ...allLocalizedValues(branch.name), ...allLocalizedValues(branch.address)]
    .join(' ')
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

export function LandingQuickSearch({ locale }: { locale: string }) {
  const t = useTranslations('public');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [results, setResults] = useState<PublicVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const throttledSearch = useThrottle(debouncedSearch, 550);
  const debouncedType = useDebounce(type, 150);
  const throttledType = useThrottle(debouncedType, 350);
  const shouldFetchPreview = throttledSearch.length >= 2 || throttledType !== 'ALL';

  useEffect(() => {
    if (!shouldFetchPreview) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    publicMenuApi
      .venues({
        page: 1,
        limit: 5,
        search: throttledSearch,
        type: throttledType,
      })
      .then((data) => {
        if (active) {
          setResults(data.venues);
        }
      })
      .catch(() => {
        if (active) {
          setResults([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [shouldFetchPreview, throttledSearch, throttledType]);

  const groupedResults = useMemo(
    () =>
      results.slice(0, 5).map((venue) => {
        const matchingBranches = venue.branches.filter((branch) => branchMatchesSearch(branch, throttledSearch));
        const branches = (matchingBranches.length ? matchingBranches : venue.branches).slice(0, 3);

        return { venue, branches };
      }),
    [results, throttledSearch],
  );

  const closeIfFocusLeaves = (event: FocusEvent<HTMLFormElement>) => {
    const nextTarget = event.relatedTarget as Node | null;

    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (type !== 'ALL') {
      params.set('type', type);
    }

    router.push(`/${locale}/venues${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="rounded-2xl border border-border bg-white/90 p-4 shadow-xl shadow-teal-100/50 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-black text-stone-950">{t('quickAccessTitle')}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('quickAccessBody')}</p>
      </div>
      <form onSubmit={submitSearch} onBlur={closeIfFocusLeaves} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
            {t('venueName')}
          </span>
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={t('venueSearchPlaceholder')}
              className="h-12 w-full rounded-xl border border-border bg-stone-50 ps-10 pe-4 text-sm font-bold outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
            {open && shouldFetchPreview ? (
              <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
                <div className="border-b border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  {t('quickSearchPreviewTitle')}
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 px-3 py-4 text-sm font-bold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-teal-600" />
                    {t('quickSearchLoading')}
                  </div>
                ) : groupedResults.length ? (
                  <div className="max-h-96 overflow-y-auto py-1">
                    {groupedResults.map(({ venue, branches }) => {
                      const venueName = textForLocale(venue.name, locale) || venue.slug;

                      return (
                        <div key={venue.id} className="border-b border-border last:border-b-0">
                          <Link
                            href={`/${locale}/venues/${venue.slug}/branches`}
                            className="flex items-center gap-3 px-3 py-3 text-start transition hover:bg-stone-50"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-50">
                              {venue.logoUrl ? (
                                <img src={venue.logoUrl} alt="" className="size-full object-cover" />
                              ) : (
                                <Store className="size-4 text-teal-700" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-black text-stone-950">{venueName}</span>
                              <span className="mt-0.5 block truncate text-xs font-bold text-muted-foreground">
                                {t(`venueTypes.${venue.type}`)} - {t('branchesCount', { count: venue.branchCount })}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-black text-teal-700">{t('viewBranches')}</span>
                          </Link>
                          {branches.length ? (
                            <div className="bg-stone-50/80 px-3 pb-2">
                              <div className="px-1 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                                {t('quickSearchMenus')}
                              </div>
                              <div className="space-y-1">
                                {branches.map((branch) => {
                                  const branchName = textForLocale(branch.name, locale) || branch.slug;

                                  return (
                                    <Link
                                      key={branch.id}
                                      href={`/${locale}/venues/${venue.slug}/${branch.slug}/menu`}
                                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-start transition hover:bg-white"
                                    >
                                      <GitBranch className="size-4 shrink-0 text-teal-700" />
                                      <span className="min-w-0 flex-1 truncate text-xs font-black text-stone-900">
                                        {branchName}
                                      </span>
                                      <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                                        {t('openMenu')}
                                      </span>
                                      <ArrowRight className="size-3.5 shrink-0 text-teal-700" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm font-bold text-muted-foreground">{t('quickSearchEmpty')}</div>
                )}
              </div>
            ) : null}
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
            {t('type')}
          </span>
          <select
            name="type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="h-12 w-full rounded-xl border border-border bg-stone-50 px-3 text-sm font-bold text-stone-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
          >
            {venueTypes.map((venueType) => (
              <option key={venueType} value={venueType}>
                {t(`venueTypes.${venueType}`)}
              </option>
            ))}
          </select>
        </label>
        <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#042f2e] text-sm font-black text-white shadow-md">
          {t('searchVenues')}
          <Store className="size-4" />
        </button>
      </form>
    </section>
  );
}
