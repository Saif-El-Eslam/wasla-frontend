'use client';

import { ImageIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MenuItem } from '@/lib/api';
import { IconButton } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { ItemPrices } from '@/components/ui/item-prices';
import { optimizedImageUrl } from '@/lib/image-url';
import { AppImage } from '@/components/ui/app-image';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

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
    <Dialog open onClose={onClose} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 grid place-items-center overflow-y-auto p-4">
      <DialogPanel className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {item.imageUrl ? (
          <div className="relative h-64 w-full">
            <AppImage
              src={optimizedImageUrl(item.imageUrl, { width: 960, height: 512, crop: 'fill' })}
              alt=""
              fill
              sizes="512px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="grid h-40 place-items-center bg-stone-100">
            <ImageIcon className="size-10 text-stone-300" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black text-stone-950">{textForLocale(item.name, locale)}</DialogTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {textForLocale(item.description, locale) || t('noDescriptionProvided')}
              </p>
            </div>
            <IconButton
              className="flex w-10 size-10 items-center justify-center rounded-2xl border border-border bg-white text-stone-600 transition hover:border-primary hover:text-primary disabled:opacity-50"
              label={t('closeItem')}
              onClick={onClose}
            >
              <X className="size-4" />
            </IconButton>
          </div>
          <ItemPrices prices={item.prices} currency={currency} noPriceText={t('noPrice')} />
        </div>
      </DialogPanel>
      </div>
    </Dialog>
  );
}
