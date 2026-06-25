import { ApiError, type LocalizedText } from '@/lib/api';
import type { Branch, MenuItem } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';

export type LocalizedDraft = { en: string; ar: string };

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function localized(en: string, ar = en) {
  return { en, ar };
}

export function readError(error: unknown) {
  console.error(error);
  return error instanceof ApiError ? error.message : 'Something went wrong';
}

export function toLocalized(draft: LocalizedDraft, fallback = 'Untitled'): LocalizedText {
  const en = draft.en.trim();
  const ar = draft.ar.trim();
  return { en: en || ar || fallback, ar: ar || en || fallback };
}

export function toLocalizedDraft(
  value: LocalizedText | string | null | undefined,
  locale = 'en',
): LocalizedDraft {
  if (typeof value === 'string') {
    return locale === 'ar' ? { en: '', ar: value } : { en: value, ar: '' };
  }

  return { en: value?.en ?? '', ar: value?.ar ?? '' };
}

export function formatMoney(
  value: string | number | null | undefined,
  currency = 'EGP',
  noPriceLabel = 'No price',
) {
  if (value === null || value === undefined || value === '') {
    return noPriceLabel;
  }

  return `${Number(value).toLocaleString()} ${currency}`;
}

export function itemPriceText(item: MenuItem, currency = 'EGP', noPriceLabel = 'No price') {
  if (item.prices?.length > 0) {
    return item.prices
      .map((price) => `${price.label} ${formatMoney(price.price, currency, noPriceLabel)}`)
      .join(' - ');
  }

  return formatMoney(item.price, currency, noPriceLabel);
}

export function getBranchStats(branch: Branch) {
  const menu = branch.menu;
  const categories = menu?.categories.length ?? 0;
  const items = menu?.categories.reduce((sum, category) => sum + category.items.length, 0) ?? 0;
  const views = menu?.analytics?.viewCount ?? 0;
  const scans = menu?.analytics?.qrScanCount ?? 0;
  const whatsapp = menu?.analytics?.whatsappClicks ?? 0;
  const calls = menu?.analytics?.callClicks ?? 0;
  const maps = menu?.analytics?.mapsClicks ?? 0;

  return { categories, items, views, scans, whatsapp, calls, maps };
}

export function localizedBranchName(branch: Branch, locale: string) {
  return textForLocale(branch.name, locale) || branch.slug;
}
