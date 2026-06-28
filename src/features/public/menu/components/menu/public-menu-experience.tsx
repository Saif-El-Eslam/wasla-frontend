'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Clock3, MapPin, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  Branch,
  BranchManagement,
  Menu,
  MenuItem,
  PublicAnalyticsEventType,
  PublicBranch,
  PublicVenue,
  Venue,
} from '@/lib/api';
import { Badge, EmptyState } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { PublicBranchActions } from '../branch/public-branch-actions';
import { PublicCategoryNav } from './public-category-nav';
import { PublicItemModal } from './public-item-modal';
import { PublicMenuItemCard } from './public-menu-item-card';

type VenueLike = Venue | PublicVenue;
type BranchLike = Branch | BranchManagement | PublicBranch;

function formatOpeningHours(branch?: BranchLike) {
  const from = branch?.openingHours?.from;
  const to = branch?.openingHours?.to;

  if (from && to) {
    return `${from} - ${to}`;
  }

  return from || to || '';
}

function logoInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'W';
}

function eventPayload(
  eventType: PublicAnalyticsEventType,
  venue: VenueLike,
  branch?: BranchLike,
  menu?: Menu | null,
  extra?: { categoryId?: string; itemId?: string },
) {
  return {
    eventType,
    venueId: venue.id,
    branchId: branch?.id,
    menuId: menu?.id,
    ...extra,
  };
}

export function PublicMenuExperience({
  venue,
  branch,
  menu,
  locale,
  currency,
  analyticsEnabled = false,
  backHref,
  languageHref,
  toolbar,
}: {
  venue: VenueLike;
  branch?: BranchLike;
  branches?: BranchLike[];
  menu: Menu | null;
  locale: string;
  currency: string;
  analyticsEnabled?: boolean;
  backHref?: string;
  languageHref?: string;
  toolbar?: ReactNode;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const [categoryId, setCategoryId] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const categories = useMemo(() => menu?.categories.filter((category) => category.active) ?? [], [menu]);
  const visibleCategories =
    categoryId === 'all' ? categories : categories.filter((category) => category.id === categoryId);
  const venueName = textForLocale(venue.name, locale) || t('waslaVenue');
  const branchName = textForLocale(branch?.name, locale);
  const address = textForLocale(branch?.address ?? venue.address, locale);
  const description = textForLocale(venue.description, locale) || t('previewBody');
  const coverUrl =
    branch?.coverUrl ??
    venue.coverUrl ??
    'https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=1200&h=600&fit=crop&auto=format';
  const logoUrl = branch?.logoUrl ?? venue.logoUrl;
  const openingHours = formatOpeningHours(branch);
  const isRtl = locale === 'ar';

  const track = (eventType: PublicAnalyticsEventType, extra?: { categoryId?: string; itemId?: string }) => {
    if (!analyticsEnabled) {
      return;
    }

    void publicMenuApi.track(eventPayload(eventType, venue, branch, menu, extra));
  };

  useEffect(() => {
    if (analyticsEnabled && menu && branch) {
      track('MENU_VIEW');
    }
    // Track once per loaded public menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsEnabled, menu?.id, branch?.id]);

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    if (nextCategoryId !== 'all') {
      track('CATEGORY_VIEW', { categoryId: nextCategoryId });
    }
  };

  const handleItemSelect = (item: MenuItem) => {
    setSelectedItem(item);
    track('ITEM_VIEW', { categoryId: item.categoryId, itemId: item.id });
  };

  return (
    <div className="min-h-dvh bg-[#fafaf8]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative h-64 overflow-visible bg-stone-200">
        <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf8] via-transparent to-black/35" />
        <div className="absolute inset-x-4 top-4 z-30 flex items-center justify-between gap-3">
          <div>
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex h-10 items-center gap-1 rounded-full bg-black/40 px-3 text-xs font-black text-white backdrop-blur"
              >
                {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                {t('back')}
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {toolbar}
            {languageHref ? (
              <Link
                href={languageHref}
                className="inline-flex h-10 items-center rounded-full bg-black/40 px-3 text-xs font-black text-white backdrop-blur"
              >
                {locale === 'ar' ? 'EN' : 'AR'}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 z-20 flex size-20 -translate-x-1/2 translate-y-1/2 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary text-3xl font-black text-white shadow-xl">
          {logoUrl ? <img src={logoUrl} alt="" className="size-full object-cover" /> : logoInitial(venueName)}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-14">
        <section className="text-center">
          <h1 className="text-3xl font-black text-stone-950">{venueName}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {branchName ? <Badge tone="teal">{branchName}</Badge> : null}
            <Badge tone={branch?.active ? 'green' : 'muted'}>
              {branch?.active ? t('openNow') : t('inactive')}
            </Badge>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
          {address ? (
            <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              <span>{address}</span>
            </div>
          ) : null}
        </section>

        <div className="mx-auto mt-5 max-w-xl space-y-3">
          <PublicBranchActions branch={branch ?? venue} onIntent={(eventType) => track(eventType)} />
          {openingHours ? (
            <div className="mx-auto inline-flex w-fit items-center justify-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-sm text-muted-foreground">
              <Clock3 className="size-4 text-primary" />
              <span>
                {t('openingHours')}: {openingHours}
              </span>
            </div>
          ) : null}
        </div>

        {!menu ? (
          <div className="mt-8">
            <EmptyState icon={UtensilsCrossed} title={t('noPublicMenuYet')} body={t('noPublicMenuBody')} />
          </div>
        ) : (
          <>
            <PublicCategoryNav
              categories={categories}
              activeCategoryId={categoryId}
              locale={locale}
              onChange={handleCategoryChange}
            />
            <div className="mt-6 space-y-8">
              {visibleCategories.map((category) => {
                const items = category.items.filter((item) => item.available);

                return (
                  <section key={category.id}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-black text-stone-950">{textForLocale(category.name, locale)}</h2>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-muted-foreground">
                        {t('itemCount', { count: items.length })}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3">
                      {items.length ? (
                        items.map((item) => (
                          <PublicMenuItemCard
                            key={item.id}
                            item={item}
                            locale={locale}
                            currency={currency}
                            onSelect={handleItemSelect}
                          />
                        ))
                      ) : (
                        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-muted-foreground">
                          {commonT('notSet')}
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>

      {selectedItem ? (
        <PublicItemModal
          item={selectedItem}
          locale={locale}
          currency={currency}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </div>
  );
}
