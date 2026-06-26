'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, PrimaryButton, cx } from '@/components/ui/dashboard-ui';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { ExtractedMenu } from '@/lib/api';

type Props = {
  draft: ExtractedMenu;
  itemCount: number;
  confidenceScore: number | null;
  onUpdateMenuName: (lang: 'en' | 'ar', value: string) => void;
  onUpdateCategory: (index: number, lang: 'en' | 'ar', value: string) => void;
  onUpdateItem: (
    categoryIndex: number,
    itemIndex: number,
    field: 'name' | 'description',
    lang: 'en' | 'ar',
    value: string,
  ) => void;
  onUpdateItemPrice: (categoryIndex: number, itemIndex: number, value: string) => void;
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
  onUpdateMenuName,
  onUpdateCategory,
  onUpdateItem,
  onUpdateItemPrice,
  onApprove,
  onReject,
  approvePending,
  rejectPending,
  approveError,
  rejectError,
}: Props) {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="teal">
          {t('extractedSummary', { categories: draft.categories.length, items: itemCount })}
        </Badge>
        {confidenceScore !== null ? (
          <Badge tone="muted">{t('confidenceScore', { score: Math.round(confidenceScore * 100) })}</Badge>
        ) : null}
      </div>

      {draft.warnings.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {draft.warnings.join(' ')}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={draft.menu.name.en ?? ''}
          onChange={(event) => onUpdateMenuName('en', event.target.value)}
          className="h-11 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
          placeholder={t('menuNameInEnglish')}
        />
        <input
          value={draft.menu.name.ar ?? ''}
          onChange={(event) => onUpdateMenuName('ar', event.target.value)}
          className="h-11 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
          placeholder={t('menuNameInArabic')}
        />
      </div>

      <div className="space-y-3">
        {draft.categories.map((category, categoryIndex) => (
          <div
            key={`${category.name.en}-${categoryIndex}`}
            className="rounded-3xl border border-border bg-stone-50 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={category.name.en ?? ''}
                onChange={(event) => onUpdateCategory(categoryIndex, 'en', event.target.value)}
                className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                placeholder={t('categoryNameInEnglish')}
              />
              <input
                value={category.name.ar ?? ''}
                onChange={(event) => onUpdateCategory(categoryIndex, 'ar', event.target.value)}
                className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                placeholder={t('categoryNameInArabic')}
              />
            </div>
            <div className="mt-3 space-y-2">
              {category.items.map((item, itemIndex) => {
                const firstPrice = item.prices?.[0]?.price ?? item.price ?? '';

                return (
                  <div
                    key={`${item.name.en}-${itemIndex}`}
                    className="grid gap-2 rounded-3xl border border-border bg-white p-2 lg:grid-cols-[minmax(0,1fr)_110px]"
                  >
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                      <input
                        value={item.name.en ?? ''}
                        onChange={(event) =>
                          onUpdateItem(categoryIndex, itemIndex, 'name', 'en', event.target.value)
                        }
                        className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                        placeholder={t('itemNameInEnglish')}
                      />
                      <input
                        value={item.name.ar ?? ''}
                        onChange={(event) =>
                          onUpdateItem(categoryIndex, itemIndex, 'name', 'ar', event.target.value)
                        }
                        className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                        placeholder={t('itemNameInArabic')}
                      />
                      <input
                        value={item.description?.en ?? ''}
                        onChange={(event) =>
                          onUpdateItem(categoryIndex, itemIndex, 'description', 'en', event.target.value)
                        }
                        className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                        placeholder={t('descriptionInEnglish')}
                      />
                      <input
                        value={item.description?.ar ?? ''}
                        onChange={(event) =>
                          onUpdateItem(categoryIndex, itemIndex, 'description', 'ar', event.target.value)
                        }
                        className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                        placeholder={t('descriptionInArabic')}
                      />
                    </div>
                    <input
                      value={String(firstPrice)}
                      onChange={(event) => onUpdateItemPrice(categoryIndex, itemIndex, event.target.value)}
                      className="h-10 rounded-3xl border border-border bg-white px-3 text-xs outline-none focus:border-primary"
                      placeholder={t('price')}
                      inputMode="decimal"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          className={cx(
            'inline-flex h-11 items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-700 transition hover:bg-red-100',
          )}
          onClick={onReject}
          disabled={rejectPending}
        >
          <XCircle className="size-4" />
          {t('rejectExtraction')}
        </button>
        <PrimaryButton onClick={onApprove} disabled={approvePending}>
          <CheckCircle2 className="size-4" />
          {t('approveExtraction')}
        </PrimaryButton>
      </div>
      {approveError ? <p className="text-xs text-red-700">{readError(approveError)}</p> : null}
      {rejectError ? <p className="text-xs text-red-700">{readError(rejectError)}</p> : null}
    </div>
  );
}
