'use client';

import { ImageIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { IconButton, itemPriceText } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { ItemPrices } from '@/components/ui/item-prices';

export function PublicItemModal({
  item,
  locale,
  currency,
  onClose,
}: {
  item: MenuItem;
  locale: string;
  currency: string;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard');

  return (
    <div className="fixed inset-0 z-100 grid bg-black/40 p-4 place-items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-64 w-full object-cover" />
        ) : (
          <div className="grid h-40 place-items-center bg-stone-100">
            <ImageIcon className="size-10 text-stone-300" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-stone-950">{textForLocale(item.name, locale)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {textForLocale(item.description, locale) || t('noDescriptionProvided')}
              </p>
            </div>
            <IconButton label={t('closeItem')} onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>
          <ItemPrices prices={item.prices} currency={currency} noPriceText={t('noPrice')} />
        </div>
      </div>
    </div>
  );
}
