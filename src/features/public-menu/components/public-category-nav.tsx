'use client';

import { useTranslations } from 'next-intl';
import type { MenuCategory } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';

export function PublicCategoryNav({
  categories,
  activeCategoryId,
  locale,
  onChange,
}: {
  categories: MenuCategory[];
  activeCategoryId: string;
  locale: string;
  onChange: (categoryId: string) => void;
}) {
  const commonT = useTranslations('common');

  return (
    <div className="sticky top-[-16px] z-10 -mx-4 mt-6 overflow-x-auto border-y border-border bg-[#fafaf8]/95 px-4 py-3 backdrop-blur">
      <div className="flex gap-2">
        <button
          className={cx(
            'h-10 shrink-0 rounded-full px-4 text-sm font-bold transition',
            activeCategoryId === 'all'
              ? 'bg-primary text-white hover:bg-primary/80'
              : 'bg-white text-stone-700 hover:bg-[#f1f1f1]/80',
          )}
          onClick={() => onChange('all')}
        >
          {commonT('all')}
        </button>
        {categories.map((category) => {
          const availableCount = category.items.filter((item) => item.available).length;

          return (
            <button
              key={category.id}
              className={cx(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition',
                activeCategoryId === category.id
                  ? 'bg-primary text-white hover:bg-primary/80'
                  : 'bg-white text-stone-700 hover:bg-[#f1f1f1]/80',
              )}
              onClick={() => onChange(category.id)}
            >
              {textForLocale(category.name, locale)}
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-[11px]',
                  activeCategoryId === category.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500',
                )}
              >
                {availableCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
