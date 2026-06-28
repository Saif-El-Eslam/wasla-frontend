import { defaultLocale, supportedLocales, type AppLocale } from '@/lib/constants';

export function isSupportedLocale(value: string | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

export function localeFromPath(pathname: string): AppLocale | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const matched = languages
    .map((language) => language.toLowerCase().split('-')[0])
    .find(isSupportedLocale);

  return matched ?? defaultLocale;
}

export function currentBrowserLocale(pathname?: string): AppLocale {
  if (pathname) {
    return localeFromPath(pathname) ?? detectBrowserLocale();
  }

  if (typeof window !== 'undefined') {
    return localeFromPath(window.location.pathname) ?? detectBrowserLocale();
  }

  return defaultLocale;
}
