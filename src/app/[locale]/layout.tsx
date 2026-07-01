import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import '../../styles/globals.css';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { PwaRegister } from '@/components/shared/pwa-register';
import { ToastProvider } from '@/components/ui/toast-provider';
import { QueryProvider } from '@/providers/query-provider';

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wasla.app');

const seo = {
  en: {
    title: 'Wasla Egypt | Digital QR menus for restaurants and cafes',
    description:
      'Wasla helps restaurants and cafes in Egypt publish Arabic and English digital menus, generate branded QR codes, manage branches, and track menu analytics.',
    ogTitle: 'Wasla Egypt | Digital menus for restaurants and cafes',
  },
  ar: {
    title: 'وصلة | منيو QR رقمي للمطاعم والكافيهات في مصر',
    description:
      'وصلة تساعد المطاعم والكافيهات في مصر على إنشاء منيو رقمي عربي وإنجليزي، توليد QR مخصص، إدارة الفروع، ومتابعة تحليلات القائمة.',
    ogTitle: 'وصلة | منيو رقمي للمطاعم والكافيهات في مصر',
  },
};

const keywords = [
  'وصلة',
  'منيو رقمي',
  'منيو QR',
  'قائمة طعام رقمية',
  'منيو مطعم QR',
  'منيو كافيه QR',
  'منيو إلكتروني',
  'منيو عربي',
  'مطاعم مصر',
  'كافيهات مصر',
  'إدارة فروع المطاعم',
  'تحليلات المطاعم',
  'Wasla',
  'Egypt digital menu',
  'restaurant QR menu Egypt',
  'cafe QR menu Egypt',
  'Arabic digital menu',
  'menu analytics Egypt',
  'restaurant branch management',
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';
  const currentSeo = seo[resolvedLocale];

  return {
    metadataBase: siteUrl,
    applicationName: 'وصلة Wasla',
    title: {
      default: currentSeo.title,
      template: `%s | ${resolvedLocale === 'ar' ? 'وصلة' : 'Wasla Egypt'}`,
    },
    description: currentSeo.description,
    keywords,
    creator: 'Wasla',
    publisher: 'Wasla',
    category: 'Restaurant technology',
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    alternates: {
      canonical: `/${resolvedLocale}`,
      languages: {
        en: '/en',
        ar: '/ar',
        'ar-EG': '/ar',
        'en-EG': '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'وصلة Wasla',
      locale: resolvedLocale === 'ar' ? 'ar_EG' : 'en_EG',
      alternateLocale: resolvedLocale === 'ar' ? ['en_EG'] : ['ar_EG'],
      title: currentSeo.ogTitle,
      description: currentSeo.description,
      images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'وصلة Wasla logo' }],
    },
    twitter: {
      card: 'summary',
      title: currentSeo.ogTitle,
      description: currentSeo.description,
      images: ['/icon-512.png'],
    },
    appleWebApp: {
      capable: true,
      title: resolvedLocale === 'ar' ? 'وصلة' : 'Wasla',
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'geo.region': 'EG',
      'geo.placename': 'Egypt',
      ICBM: '26.8206,30.8025',
      'DC.language': resolvedLocale === 'ar' ? 'ar-EG' : 'en-EG',
    },
  };
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Wasla',
  alternateName: 'وصلة',
  url: siteUrl.toString(),
  logo: new URL('/icon-512.png', siteUrl).toString(),
  areaServed: {
    '@type': 'Country',
    name: 'Egypt',
  },
  knowsAbout: [
    'منيو رقمي',
    'منيو QR',
    'Digital restaurant menus',
    'Restaurant branch management',
    'Menu analytics',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d9488',
  colorScheme: 'light',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
          <ToastProvider>
            <QueryProvider>
              <PwaRegister />
              <PullToRefresh />
              {children}
            </QueryProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
