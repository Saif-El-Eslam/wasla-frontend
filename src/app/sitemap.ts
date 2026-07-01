import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wasla.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    '',
    '/venues',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/register',
  ];

  return ['en', 'ar'].flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: now,
      alternates: {
        languages: {
          en: `${siteUrl}/en${route}`,
          ar: `${siteUrl}/ar${route}`,
          'ar-EG': `${siteUrl}/ar${route}`,
          'en-EG': `${siteUrl}/en${route}`,
        },
      },
      changeFrequency: route ? 'weekly' : 'daily',
      priority: locale === 'ar' ? (route ? 0.8 : 1) : route ? 0.7 : 0.95,
    })),
  );
}
