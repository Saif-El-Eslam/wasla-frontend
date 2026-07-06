'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';
import { ItemPrices } from '@/components/ui/item-prices';
import { optimizedImageUrl } from '@/lib/image-url';
import { AppImage } from '@/components/ui/app-image';

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
      className="group flex w-full cursor-pointer flex-col gap-3 rounded-3xl border border-border bg-white p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-4 lg:flex-row lg:items-center"
    >
      <div className="flex w-full min-w-0 flex-1 gap-3">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-100 sm:size-24 lg:size-[76px]">
          {item.imageUrl ? (
            <AppImage
              src={optimizedImageUrl(item.imageUrl, { width: 240, height: 240, crop: 'fill' })}
              alt=""
              fill
              sizes="96px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <ImageIcon className="size-6 text-stone-300" />
          )}
        </div>

        <div className="min-w-0 flex-1 self-center">
          <p className="break-words text-base font-black leading-tight text-stone-950 sm:text-lg lg:truncate lg:text-base">
            {textForLocale(item.name, locale)}
          </p>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {textForLocale(item.description, locale) || t('tapForDetails')}
          </p>
        </div>
      </div>

      <div className="w-full border-t border-border pt-3 lg:w-auto lg:max-w-[45%] lg:shrink-0 lg:border-t-0 lg:pt-0">
        <ItemPrices prices={item.prices ?? []} currency={currency} noPriceText={t('noPrice')} />
      </div>
    </article>
  );
}
