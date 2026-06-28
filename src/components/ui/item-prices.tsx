'use client';
import type { MenuItemPrice } from '@/lib/api';

export function ItemPrices({
  prices,
  currency,
  noPriceText,
}: {
  prices: MenuItemPrice[];
  currency: string;
  noPriceText: string;
}) {
  if (!prices || prices.length === 0) {
    return <p className="text-xs font-bold text-muted-foreground md:text-end">{noPriceText}</p>;
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-1.5 lg:justify-end">
      {prices.map((price) => (
        <div
          key={`${price.label}-${price.price}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary"
        >
          <span className="max-w-[7rem] truncate text-stone-600 sm:max-w-[9rem]">{price.label}</span>

          <span className="whitespace-nowrap">
            {price.price} {currency}
          </span>
        </div>
      ))}
    </div>
  );
}
