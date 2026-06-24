export const supportedLocales = ['en', 'ar'] as const;

export const defaultLocale = 'en';

export type AppLocale = (typeof supportedLocales)[number];
