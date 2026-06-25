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
  if (prices.length === 0) {
    return <p className="mt-1 text-xs font-bold text-muted-foreground">{noPriceText}</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {prices.map((price) => (
        <div
          key={`${price.label}-${price.price}`}
          className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary"
        >
          <span className="max-w-24 truncate text-stone-600">{price.label}</span>

          <span>
            {price.price} {currency}
          </span>
        </div>
      ))}
    </div>
  );
}
