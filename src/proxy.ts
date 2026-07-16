import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { defaultLocale, supportedLocales, type AppLocale } from './lib/constants';

const localeCookie = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax' as const,
};

function isSupportedLocale(value: string | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

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

  const match = locales.find((item) => isSupportedLocale(item.locale));
  return match ? (match.locale as AppLocale) : defaultLocale;
}

function firstPathSegment(pathname: string) {
  return pathname.split('/').filter(Boolean)[0];
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = firstPathSegment(pathname);

  if (isSupportedLocale(firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', firstSegment, localeCookie);
    return response;
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const detectedLocale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : parseAcceptLanguage(request.headers.get('accept-language'));
  const pathWithoutUnsupportedLocale =
    firstSegment && /^[a-z]{2}$/i.test(firstSegment)
      ? `/${pathname.split('/').filter(Boolean).slice(1).join('/')}`
      : pathname;
  const targetPath = pathWithoutUnsupportedLocale === '/' ? '' : pathWithoutUnsupportedLocale;
  const response = NextResponse.redirect(new URL(`/${detectedLocale}${targetPath}`, request.url));
  response.cookies.set('NEXT_LOCALE', detectedLocale, localeCookie);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
