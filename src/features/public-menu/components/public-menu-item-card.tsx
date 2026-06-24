'use client';

import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { itemPriceText } from '@/components/ui/dashboard-ui';
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

  return (
    <button
      className="grid gap-3 rounded-2xl border border-border bg-white p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[76px_1fr_auto]"
      onClick={() => onSelect(item)}
    >
      <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-stone-100">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <ImageIcon className="size-6 text-stone-300" />}
      </div>
      <div>
        <p className="font-black text-stone-950">{textForLocale(item.name, locale)}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{textForLocale(item.description, locale) || t('tapForDetails')}</p>
      </div>
      <p className="self-center text-sm font-black text-primary">{itemPriceText(item, currency, t('noPrice'))}</p>
    </button>
  );
}
