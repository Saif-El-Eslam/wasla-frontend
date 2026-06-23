import type { LocalizedText } from '@/api';

export function textForLocale(value: LocalizedText | string | null | undefined, locale: string, fallback = 'en') {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value[locale] || value[fallback] || value.ar || value.en || Object.values(value).find(Boolean) || '';
}
