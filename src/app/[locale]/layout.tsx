import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '../../styles/globals.css';
import { ToastProvider } from '@/components/ui/toast-provider';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'Wasla',
  description: 'Menu SaaS platform for food-service venues',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';
  setRequestLocale(resolvedLocale);
  const messages = await getMessages({ locale: resolvedLocale });
  const dir = resolvedLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={resolvedLocale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
          <ToastProvider>
            <QueryProvider>{children}</QueryProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
