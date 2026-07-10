type PublicQueryValue = string | number | boolean | null | undefined;
type PublicQueryInput = URLSearchParams | Record<string, PublicQueryValue>;

export function withPublicParam(href: string) {
  const [path, query = ''] = href.split('?');
  const params = new URLSearchParams(query);
  params.set('public', '1');
  const queryString = params.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export function publicHref(locale: string, path = '', query?: PublicQueryInput) {
  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : '';
  const params = new URLSearchParams();

  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => params.set(key, value));
  } else if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value != null && value !== '') {
        params.set(key, String(value));
      }
    });
  }

  params.set('public', '1');

  return `/${locale}${normalizedPath}?${params.toString()}`;
}