import { defineRouting } from 'next-intl/routing';
import { defaultLocale, supportedLocales } from '@/lib/constants';

export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale,
});
