import { getRequestConfig } from 'next-intl/server';
import ar from './messages/ar.json';
import en from './messages/en.json';

const messages = {
  ar,
  en,
};

type Locale = keyof typeof messages;

function resolveLocale(locale?: string): Locale {
  return locale === 'ar' ? 'ar' : 'en';
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = resolveLocale((await requestLocale) ?? undefined);

  return {
    locale,
    messages: messages[locale],
  };
});
