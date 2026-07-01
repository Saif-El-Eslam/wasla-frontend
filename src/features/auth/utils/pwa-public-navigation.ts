const PUBLIC_MODE_QUERY_PARAM = 'public';

export function publicLandingHref(locale: string) {
  return `/${locale}?${PUBLIC_MODE_QUERY_PARAM}=1`;
}

const PUBLIC_NAVIGATION_KEY = 'wasla:intentional-public-navigation';

export function markPublicNavigationFromUrl(searchParams?: URLSearchParams | null) {
  const publicMode = searchParams?.get(PUBLIC_MODE_QUERY_PARAM) === '1';

  if (publicMode) {
    sessionStorage.setItem('wasla:intentional-public-navigation', 'true');
  }
}

export function isIntentionalPublicNavigation() {
  return sessionStorage.getItem(PUBLIC_NAVIGATION_KEY) === 'true';
}

export function clearIntentionalPublicNavigation() {
  sessionStorage.removeItem(PUBLIC_NAVIGATION_KEY);
}
