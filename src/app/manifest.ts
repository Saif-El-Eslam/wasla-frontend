import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'وصلة Wasla | منيو QR للمطاعم في مصر',
    short_name: 'وصلة',
    description:
      'منيو رقمي عربي وإنجليزي، QR مخصص، إدارة فروع، وتحليلات للمطاعم والكافيهات في مصر.',
    lang: 'ar-EG',
    dir: 'rtl',
    start_url: '/ar',
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
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
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
