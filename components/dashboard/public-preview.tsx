'use client';

import { useState } from 'react';
import { Globe2, ImageIcon, UtensilsCrossed, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/api';
import { Badge, EmptyState, IconButton, cx, itemPriceText } from '@/components/dashboard/dashboard-ui';
import { useBranchMenu, useBranchOptions } from '@/hooks/use-venue';
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
  const commonT = useTranslations('common');
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const effectiveBranchId = branches.some((item) => item.id === branchId) ? branchId : defaultBranchId;
  const menuQuery = useBranchMenu(effectiveBranchId);
  const branch = branches.find((item) => item.id === effectiveBranchId);
  const menu = menuQuery.data;
  const [categoryId, setCategoryId] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const categories = menu?.categories.filter((category) => category.active) ?? [];
  const visibleCategories = categoryId === 'all' ? categories : categories.filter((category) => category.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fafaf8]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-[#fafaf8]/90 px-4 py-3 backdrop-blur">
        <button className="inline-flex h-10 items-center gap-2 rounded-full bg-[#042f2e] px-4 text-sm font-bold text-white" onClick={onClose}>
          <X className="size-4" />
          {t('previewDashboard')}
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-stone-700">
          <Globe2 className="size-4" />
          {locale.toUpperCase()}
        </button>
      </div>
      <div className="relative h-60 overflow-hidden bg-stone-200">
        <img src="https://images.unsplash.com/photo-1542181961-9590d0c79dab?w=1200&h=600&fit=crop&auto=format" alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf8] via-transparent to-black/30" />
        <div className="absolute bottom-0 left-1/2 flex size-20 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-3xl border-4 border-white bg-primary text-3xl font-black text-white shadow-xl">W</div>
      </div>
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-14">
        <div className="text-center">
          <h1 className="text-3xl font-black text-stone-950">{venueName || t('waslaVenue')}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge tone="teal">{branch ? textForLocale(branch.name, locale) : t('noBranch')}</Badge>
            <Badge tone="green">{t('openNow')}</Badge>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t('previewBody')}</p>
        </div>

        {!menu ? (
          <div className="mt-8">
            <EmptyState icon={UtensilsCrossed} title={t('noPublicMenuYet')} body={t('noPublicMenuBody')} />
          </div>
        ) : (
          <>
            <div className="sticky top-[65px] z-10 -mx-4 mt-6 overflow-x-auto border-y border-border bg-[#fafaf8]/95 px-4 py-3 backdrop-blur">
              <div className="flex gap-2">
                <button className={cx('h-10 shrink-0 rounded-full px-4 text-sm font-bold transition', categoryId === 'all' ? 'bg-primary text-white' : 'bg-white text-stone-700')} onClick={() => setCategoryId('all')}>
                  {commonT('all')}
                </button>
                {categories.map((category) => (
                  <button key={category.id} className={cx('h-10 shrink-0 rounded-full px-4 text-sm font-bold transition', categoryId === category.id ? 'bg-primary text-white' : 'bg-white text-stone-700')} onClick={() => setCategoryId(category.id)}>
                    {textForLocale(category.name, locale)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-8">
              {visibleCategories.map((category) => (
                <section key={category.id}>
                  <h2 className="text-xl font-black text-stone-950">{textForLocale(category.name, locale)}</h2>
                  <div className="mt-3 grid gap-3">
                    {category.items.filter((item) => item.available).map((item) => (
                      <button key={item.id} className="grid gap-3 rounded-2xl border border-border bg-white p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[76px_1fr_auto]" onClick={() => setSelectedItem(item)}>
                        <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-stone-100">
                          {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <ImageIcon className="size-6 text-stone-300" />}
                        </div>
                        <div>
                          <p className="font-black text-stone-950">{textForLocale(item.name, locale)}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{textForLocale(item.description, locale) || t('tapForDetails')}</p>
                        </div>
                        <p className="self-center text-sm font-black text-primary">{itemPriceText(item, currency, t('noPrice'))}</p>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
      {selectedItem ? (
        <div className="fixed inset-0 z-20 grid place-items-end bg-black/40 p-4 sm:place-items-center" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            {selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt="" className="h-64 w-full object-cover" /> : <div className="grid h-40 place-items-center bg-stone-100"><ImageIcon className="size-10 text-stone-300" /></div>}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-stone-950">{textForLocale(selectedItem.name, locale)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{textForLocale(selectedItem.description, locale) || t('noDescriptionProvided')}</p>
                </div>
                <IconButton label={t('closeItem')} onClick={() => setSelectedItem(null)}>
                  <X className="size-4" />
                </IconButton>
              </div>
              <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-black text-primary">{itemPriceText(selectedItem, currency, t('noPrice'))}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

