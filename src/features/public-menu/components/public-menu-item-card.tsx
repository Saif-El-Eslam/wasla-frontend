'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';

export function PublicMenuItemCard({
  item,
  locale,
  currency,
  onSelect,
}: {
  item: MenuItem;
  locale: string;
  currency: string;
  onSelect: (item: MenuItem) => void;
}) {
  const t = useTranslations('dashboard');
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  const prices = item.prices ?? [];
  const selectedPrice = prices[selectedPriceIndex];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(item);
        }
      }}
      className="group flex w-full cursor-pointer flex-col gap-3 rounded-3xl border border-border bg-white p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:p-4"
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 sm:size-[76px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="size-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="size-6 text-stone-300" />
          )}
        </div>

        <div className="min-w-0 flex-1 self-center">
          <p className="truncate text-base font-black text-stone-950">{textForLocale(item.name, locale)}</p>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {textForLocale(item.description, locale) || t('tapForDetails')}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border pt-3 sm:min-w-36 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        {prices.length > 1 ? (
          <div
            className="flex max-w-full overflow-hidden rounded-full border border-border bg-stone-50 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            {prices.map((price, index) => (
              <button
                key={`${price.label}-${index}`}
                type="button"
                onClick={() => setSelectedPriceIndex(index)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  selectedPriceIndex === index
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-white hover:text-stone-900'
                }`}
              >
                {price.label}
              </button>
            ))}
          </div>
        ) : null}

        <p className="whitespace-nowrap text-lg font-black text-primary">
          {selectedPrice ? `${selectedPrice.price} ${currency}` : t('noPrice')}
        </p>
      </div>
    </article>
  );
}
