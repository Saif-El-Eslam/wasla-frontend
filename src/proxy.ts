import { NextResponse, type NextRequest } from 'next/server';

import { defaultLocale, supportedLocales, type AppLocale } from '@/lib/constants';

function parseAcceptLanguage(value: string | null): AppLocale {
  if (!value) {
    return defaultLocale;
  }

  const locales = value
    .split(',')
    .map((part) => {
      const [tag = '', qValue] = part.trim().split(';q=');
      const locale = tag.toLowerCase().split('-')[0];
      const q = qValue ? Number(qValue) : 1;

      return { locale, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  const match = locales.find((item) => supportedLocales.includes(item.locale as AppLocale));
  return (match?.locale as AppLocale | undefined) ?? defaultLocale;
}

function firstPathSegment(pathname: string) {
  return pathname.split('/').filter(Boolean)[0];
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = firstPathSegment(pathname);
  const detectedLocale = parseAcceptLanguage(request.headers.get('accept-language'));

  if (supportedLocales.includes(firstSegment as AppLocale)) {
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', firstSegment, { sameSite: 'lax' });
    return response;
  }

  if (pathname === '/') {
    const response = NextResponse.redirect(new URL(`/${detectedLocale}`, request.url));
    response.cookies.set('NEXT_LOCALE', detectedLocale, { sameSite: 'lax' });
    return response;
  }

  const pathWithoutUnsupportedLocale =
    firstSegment && /^[a-z]{2}$/i.test(firstSegment)
      ? `/${pathname.split('/').filter(Boolean).slice(1).join('/')}`
      : pathname;
  const targetPath = pathWithoutUnsupportedLocale === '/' ? '' : pathWithoutUnsupportedLocale;
  const response = NextResponse.redirect(new URL(`/${detectedLocale}${targetPath}`, request.url));
  response.cookies.set('NEXT_LOCALE', detectedLocale, { sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
