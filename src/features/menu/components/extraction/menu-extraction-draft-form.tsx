'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, Plus, Trash2, X, XCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, PrimaryButton, SecondaryButton, cx } from '@/components/ui/dashboard-ui';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { ExtractedMenu } from '@/lib/api';
type Props = {
  draft: ExtractedMenu;
  itemCount: number;
  confidenceScore: number | null;

  onUpdateCategory: (index: number, lang: 'en' | 'ar', value: string) => void;

  onUpdateItem: (
    categoryIndex: number,
    itemIndex: number,
    field: 'name' | 'description',
    lang: 'en' | 'ar',
    value: string,
  ) => void;

  onUpdateItemPrice: (
    categoryIndex: number,
    itemIndex: number,
    value: string,
    priceIndex?: number,
    field?: 'price' | 'label',
  ) => void;

  onAddCategory?: () => void;
  onRemoveCategory?: (categoryIndex: number) => void;

  onAddItem?: (categoryIndex: number) => void;
  onRemoveItem?: (categoryIndex: number, itemIndex: number) => void;

  onAddItemPrice?: (categoryIndex: number, itemIndex: number) => void;
  onRemoveItemPrice?: (categoryIndex: number, itemIndex: number, priceIndex: number) => void;

  onApprove: () => void;
  onReject: () => void;

  approvePending: boolean;
  rejectPending: boolean;
  approveError?: Error | null;
  rejectError?: Error | null;
};

export function MenuExtractionDraftForm({
  draft,
  itemCount,
  confidenceScore,
  onUpdateCategory,
  onUpdateItem,
  onUpdateItemPrice,
  onAddCategory,
  onRemoveCategory,
  onAddItem,
  onRemoveItem,
  onAddItemPrice,
  onRemoveItemPrice,
  onApprove,
  onReject,
  approvePending,
  rejectPending,
  approveError,
  rejectError,
}: Props) {
  const t = useTranslations('dashboard');

  const [openCategoryIndexes, setOpenCategoryIndexes] = useState<Set<number>>(() => new Set([]));

  const toggleCategoryOpen = (categoryIndex: number) => {
    setOpenCategoryIndexes((current) => {
      const next = new Set(current);

      if (next.has(categoryIndex)) next.delete(categoryIndex);
      else next.add(categoryIndex);

      return next;
    });
  };

  return (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="teal">
          {t('extractedSummary', {
            categories: draft.categories.length,
            items: itemCount,
          })}
        </Badge>

        {confidenceScore !== null ? (
          <Badge tone="muted">
            {t('confidenceScore', {
              score: Math.round(confidenceScore * 100),
            })}
          </Badge>
        ) : null}
      </div>
      {draft.warnings.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {draft.warnings.join(' ')}
        </div>
      ) : null}
      <div className="space-y-3">
        {draft.categories.map((category, categoryIndex) => {
          const isOpen = openCategoryIndexes.has(categoryIndex);

          return (
            <section
              key={`${category.name.en || category.name.ar || 'category'}-${categoryIndex}`}
              className={cx('overflow-hidden rounded-[28px] border bg-white transition-all border-stone-200')}
            >
              <div className="flex flex-col gap-3 border-b border-stone-100 px-3 py-3 sm:flex-row sm:items-center sm:px-4 sm:py-4">
                <div className="grid w-full min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <input
                    value={category.name.en ?? ''}
                    onChange={(event) => onUpdateCategory(categoryIndex, 'en', event.target.value)}
                    className="h-11 rounded-3xl border border-stone-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder={t('categoryNameInEnglish')}
                  />
                  <input
                    value={category.name.ar ?? ''}
                    dir="rtl"
                    onChange={(event) => onUpdateCategory(categoryIndex, 'ar', event.target.value)}
                    className="h-11 rounded-3xl border border-stone-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder={t('categoryNameInArabic')}
                  />
                </div>
                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                  <div className="flex size-8 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                    {category.items.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <SecondaryButton
                      type="button"
                      onClick={() => onRemoveCategory?.(categoryIndex)}
                      disabled={!onRemoveCategory}
                      className="flex size-9 items-center justify-center rounded-full text-stone-300 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <X className="size-4" />
                    </SecondaryButton>

                    <SecondaryButton
                      type="button"
                      onClick={() => toggleCategoryOpen(categoryIndex)}
                      className="flex size-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                      <ChevronDown className={cx('size-4 transition-transform', !isOpen && '-rotate-90')} />
                    </SecondaryButton>
                  </div>
                </div>
              </div>

              {isOpen ? (
                <div className="space-y-2 bg-stone-50/60 p-2 sm:p-4">
                  {category.items.map((item, itemIndex) => {
                    const prices =
                      item.prices && item.prices.length > 0
                        ? item.prices
                        : [{ label: 'Regular', price: item.price ?? '' }];

                    return (
                      <div
                        key={`${item.name.en || item.name.ar || 'item'}-${itemIndex}`}
                        className="rounded-[22px] border border-stone-200 bg-white p-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <div className="w-full space-y-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <input
                                value={item.name.en ?? ''}
                                onChange={(event) =>
                                  onUpdateItem(categoryIndex, itemIndex, 'name', 'en', event.target.value)
                                }
                                className="h-10 rounded-3xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder={t('itemNameInEnglish')}
                              />
                              <input
                                value={item.name.ar ?? ''}
                                dir="rtl"
                                onChange={(event) =>
                                  onUpdateItem(categoryIndex, itemIndex, 'name', 'ar', event.target.value)
                                }
                                className="h-10 rounded-3xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder={t('itemNameInArabic')}
                              />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                              <input
                                value={item.description?.en ?? ''}
                                onChange={(event) =>
                                  onUpdateItem(
                                    categoryIndex,
                                    itemIndex,
                                    'description',
                                    'en',
                                    event.target.value,
                                  )
                                }
                                className="h-10 rounded-3xl border border-stone-200 bg-white px-4 text-xs text-stone-600 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder={t('descriptionInEnglish')}
                              />
                              <input
                                value={item.description?.ar ?? ''}
                                dir="rtl"
                                onChange={(event) =>
                                  onUpdateItem(
                                    categoryIndex,
                                    itemIndex,
                                    'description',
                                    'ar',
                                    event.target.value,
                                  )
                                }
                                className="h-10 rounded-3xl border border-stone-200 bg-white px-4 text-xs text-stone-600 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                placeholder={t('descriptionInArabic')}
                              />
                            </div>

                            <div className="flex flex-col items-stretch gap-2 border-t border-stone-100 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                              <span className="text-xs font-bold text-stone-400">
                                {t('prices').toUpperCase()}
                              </span>
                              {prices.map((price, priceIndex) => (
                                <div
                                  key={priceIndex}
                                  className="grid grid-cols-[auto_1fr_1fr] items-center gap-1 rounded-2xl border border-stone-200 bg-white px-2 py-1 sm:flex sm:rounded-full"
                                >
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => onRemoveItemPrice?.(categoryIndex, itemIndex, priceIndex)}
                                    disabled={!onRemoveItemPrice}
                                    className="flex size-5 items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                                  >
                                    <X className="size-3" />
                                  </SecondaryButton>

                                  <input
                                    value={price.price ?? ''}
                                    onChange={(event) =>
                                      onUpdateItemPrice(
                                        categoryIndex,
                                        itemIndex,
                                        event.target.value,
                                        priceIndex,
                                        'price',
                                      )
                                    }
                                    inputMode="decimal"
                                    className="h-8 min-w-0 rounded-xl border border-transparent px-2 text-center text-xs font-bold text-teal-600 outline-none focus:border-primary sm:h-7 sm:w-14 sm:rounded-full"
                                    placeholder="EGP 0"
                                  />

                                  <input
                                    value={price.label ?? ''}
                                    onChange={(event) =>
                                      onUpdateItemPrice(
                                        categoryIndex,
                                        itemIndex,
                                        event.target.value,
                                        priceIndex,
                                        'label',
                                      )
                                    }
                                    className="h-8 min-w-0 rounded-xl border border-transparent px-2 text-xs font-semibold text-stone-500 outline-none focus:border-primary sm:h-7 sm:w-20 sm:rounded-full"
                                    placeholder="Regular"
                                  />
                                </div>
                              ))}
                              <SecondaryButton
                                type="button"
                                onClick={() => onAddItemPrice?.(categoryIndex, itemIndex)}
                                disabled={!onAddItemPrice}
                                className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 text-xs font-bold text-stone-400 transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                              >
                                <Plus className="size-3" />
                                {t('price')}
                              </SecondaryButton>
                            </div>
                          </div>
                          <SecondaryButton
                            type="button"
                            onClick={() => onRemoveItem?.(categoryIndex, itemIndex)}
                            disabled={!onRemoveItem}
                            className="flex h-9 w-full shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-40 sm:mt-1 sm:size-8 sm:rounded-full sm:border-0 sm:bg-transparent sm:text-stone-300"
                          >
                            <Trash2 className="size-3.5" />
                          </SecondaryButton>
                        </div>
                      </div>
                    );
                  })}
                  <SecondaryButton
                    type="button"
                    onClick={() => onAddItem?.(categoryIndex)}
                    disabled={!onAddItem}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-stone-300 text-xs font-bold text-stone-400 transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                    {t('addItem')}
                  </SecondaryButton>
                </div>
              ) : null}
            </section>
          );
        })}

        <SecondaryButton
          type="button"
          onClick={onAddCategory}
          disabled={!onAddCategory}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[24px] border border-dashed border-stone-300 bg-white text-sm font-bold text-stone-400 transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-4" />
          {t('addCategory')}
        </SecondaryButton>
      </div>
      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 border-t border-stone-100 bg-white/95 px-1 pb-6 backdrop-blur sm:flex-row sm:justify-end sm:py-0 sm:px-0">
        <SecondaryButton
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
          onClick={onReject}
          disabled={rejectPending}
        >
          {rejectPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}

          {rejectPending ? t('rejectingExtraction') : t('rejectExtraction')}
        </SecondaryButton>

        <PrimaryButton onClick={onApprove} disabled={approvePending}>
          {approvePending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}

          {approvePending ? t('approvingExtraction') : t('approveExtraction')}
        </PrimaryButton>
      </div>
      {approveError ? <p className="text-xs text-red-700">{readError(approveError)}</p> : null}
      {rejectError ? <p className="text-xs text-red-700">{readError(rejectError)}</p> : null}
    </div>
  );
}
