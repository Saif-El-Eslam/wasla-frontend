import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const acceptLanguage = (await headers()).get('accept-language') ?? '';
  const isArabic = acceptLanguage.toLowerCase().startsWith('ar');

  return {
    name: isArabic ? 'وصلة Wasla | منيو رقمي للمطاعم في مصر' : 'Wasla | QR Menu for Restaurants in Egypt',

    short_name: isArabic ? 'وصلة' : 'Wasla',

    description: isArabic
      ? 'منيو رقمي عربي وإنجليزي، كود مخصص، إدارة فروع، وتحليلات للمطاعم والكافيهات في مصر.'
      : 'Digital QR menus, branch management, analytics, and multilingual support for restaurants and cafés in Egypt.',

    lang: isArabic ? 'ar-EG' : 'en',
    dir: isArabic ? 'rtl' : 'ltr',

    start_url: isArabic ? '/ar/dashboard' : '/en/dashboard',

    scope: '/',
    display: 'standalone',
    background_color: '#f8fafa',
    theme_color: '#0d9488',
    orientation: 'portrait',

    categories: ['business', 'food', 'productivity'],

    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/maskable-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
