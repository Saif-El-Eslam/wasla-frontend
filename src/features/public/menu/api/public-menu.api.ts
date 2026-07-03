import type {
  ApiEnvelope,
  PublicAnalyticsEventInput,
  PublicBranchMenuResponse,
  PublicVenueListResponse,
  PublicVenueResponse,
} from '@/lib/api';
import { toQueryString } from '@/lib/api';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function resolvedLocaleParam(locale?: string) {
  return locale === 'ar' || locale === 'en' ? locale : undefined;
}

function localeHeaders(locale?: string) {
  const resolvedLocale = resolvedLocaleParam(locale);

  return resolvedLocale
    ? {
        'x-locale': resolvedLocale,
        'Accept-Language': resolvedLocale,
      }
    : {};
}

async function publicApi<T>(path: string, init?: RequestInit, locale?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');

  for (const [key, value] of Object.entries(localeHeaders(locale))) {
    headers.set(key, value);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: init?.cache ?? 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const publicMenuApi = {
  venues: (params: { page?: number; limit?: number; search?: string; type?: string; locale?: string }) =>
    publicApi<PublicVenueListResponse>(
      `/public/venues${toQueryString({
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        search: params.search || undefined,
        type: params.type && params.type !== 'ALL' ? params.type : undefined,
        locale: resolvedLocaleParam(params.locale),
      })}`,
      undefined,
      params.locale,
    ),
  venue: (venueSlug: string, locale?: string) =>
    publicApi<PublicVenueResponse>(
      `/public/venues/${venueSlug}${toQueryString({ locale: resolvedLocaleParam(locale) })}`,
      undefined,
      locale,
    ),
  branchMenu: (venueSlug: string, branchSlug: string, locale?: string) =>
    publicApi<PublicBranchMenuResponse>(
      `/public/venues/${venueSlug}/${branchSlug}/menu${toQueryString({ locale: resolvedLocaleParam(locale) })}`,
      undefined,
      locale,
    ),
  track: (input: PublicAnalyticsEventInput) =>
    publicApi<{ tracked: boolean }>('/public/analytics', {
      method: 'POST',
      body: JSON.stringify(input),
      keepalive: true,
    }).catch(() => ({ tracked: false })),
};
