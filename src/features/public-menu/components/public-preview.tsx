'use client';

import { useEffect, useState } from 'react';
import { Globe2, UtensilsCrossed, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { EmptyState } from '@/components/ui/dashboard-ui';
import { PublicBranchInfo } from '@/features/public-menu/components/public-branch-info';
import { PublicBranchSwitcher } from '@/features/public-menu/components/public-branch-switcher';
import { PublicCategoryNav } from '@/features/public-menu/components/public-category-nav';
import { PublicItemModal } from '@/features/public-menu/components/public-item-modal';
import { PublicMenuItemCard } from '@/features/public-menu/components/public-menu-item-card';
import { useBranchManagement, useBranchMenu } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

export function PublicPreview({
  venueName,
  branchId,
  locale,
  currency,
  onClose,
}: {
  venueName: string;
  branchId: string;
  locale: string;
  currency: string;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard');
  const branchManagement = useBranchManagement();
  const branches = branchManagement.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const [selectedBranchId, setSelectedBranchId] = useState(branchId);
  const effectiveBranchId = branches.some((item) => item.id === selectedBranchId)
    ? selectedBranchId
    : defaultBranchId;
  const menuQuery = useBranchMenu(effectiveBranchId);
  const branch = branches.find((item) => item.id === effectiveBranchId);
  const menu = menuQuery.data;
  const [categoryId, setCategoryId] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const categories = menu?.categories.filter((category) => category.active) ?? [];
  const visibleCategories =
    categoryId === 'all' ? categories : categories.filter((category) => category.id === categoryId);

  useEffect(() => {
    setSelectedBranchId(branchId);
  }, [branchId]);

  useEffect(() => {
    setCategoryId('all');
    setSelectedItem(null);
  }, [effectiveBranchId]);

  const coverUrl =
    branch?.coverUrl ??
    'https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=1200&h=600&fit=crop&auto=format';
  const logoText = (venueName || textForLocale(branch?.name, locale) || 'Wasla')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fafaf8]">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-[#fafaf8]/90 px-4 py-3 backdrop-blur z-50">
        <button
          className="inline-flex h-10 items-center gap-1 rounded-full bg-[#042f2e] hover:bg-[#042f2e]/90 px-4 text-sm font-bold text-white"
          onClick={onClose}
        >
          {locale === 'en' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          <LayoutDashboard className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          <PublicBranchSwitcher
            branches={branches}
            value={effectiveBranchId}
            locale={locale}
            onChange={setSelectedBranchId}
          />
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-stone-700">
            <Globe2 className="size-4" />
            {locale.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="relative h-60 overflow-visible bg-stone-200">
        <div className="absolute inset-0 overflow-hidden">
          <img src={coverUrl} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf8] via-transparent to-black/30" />
        </div>
        <div className="absolute bottom-0 left-1/2 z-30 flex size-20 -translate-x-1/2 translate-y-1/2 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-primary text-3xl font-black text-white shadow-xl">
          {branch?.logoUrl ? (
            <img src={branch.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            logoText
          )}
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-14">
        <PublicBranchInfo venueName={venueName} branch={branch} locale={locale} />

        {branchManagement.isLoading || menuQuery.isLoading ? (
          <div className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm font-bold text-muted-foreground">
            {t('loadingWorkspace')}
          </div>
        ) : !menu ? (
          <div className="mt-8">
            <EmptyState icon={UtensilsCrossed} title={t('noPublicMenuYet')} body={t('noPublicMenuBody')} />
          </div>
        ) : (
          <>
            <PublicCategoryNav
              categories={categories}
              activeCategoryId={categoryId}
              locale={locale}
              onChange={setCategoryId}
            />
            <div className="mt-6 space-y-8">
              {visibleCategories.map((category) => (
                <section key={category.id}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-stone-950">
                      {textForLocale(category.name, locale)}
                    </h2>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-muted-foreground">
                      {t('itemCount', { count: category.items.filter((item) => item.available).length })}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    {category.items
                      .filter((item) => item.available)
                      .map((item) => (
                        <PublicMenuItemCard
                          key={item.id}
                          item={item}
                          locale={locale}
                          currency={currency}
                          onSelect={setSelectedItem}
                        />
                      ))}
                  </div>
                </section>
              ))}
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
