import type {
  ApiEnvelope,
  PublicAnalyticsEventInput,
  PublicBranchMenuResponse,
  PublicFeedbackInput,
  PublicFeedbackListResponse,
  PublicFeedbackResponse,
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
  const method = init?.method ?? 'GET';
  const isRead = method === 'GET' || method === 'HEAD';

  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');

  for (const [key, value] of Object.entries(localeHeaders(locale))) {
    headers.set(key, value);
  }

  const requestInit: RequestInit & { next?: { revalidate: number } } = {
    ...init,
    method,
    headers,
    cache: init?.cache ?? (isRead ? 'force-cache' : 'no-store'),
    next: isRead ? { revalidate: 30 } : undefined,
  };

  const response = await fetch(`${apiBaseUrl}${path}`, requestInit);

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
  feedback: (params: { venueId: string; branchId: string; page?: number; limit?: number; locale?: string }) =>
    publicApi<PublicFeedbackListResponse>(
      `/public/feedback${toQueryString({
        venueId: params.venueId,
        branchId: params.branchId,
        page: params.page ?? 1,
        limit: params.limit ?? 8,
      })}`,
      { cache: 'no-store' },
      params.locale,
    ),
  submitFeedback: (input: PublicFeedbackInput) =>
    publicApi<PublicFeedbackResponse>('/public/feedback', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  trackGoogleReviewClick: (feedbackId: string) =>
    publicApi<{ tracked: boolean }>('/public/feedback/google-click', {
      method: 'POST',
      body: JSON.stringify({ feedbackId }),
      keepalive: true,
    }).catch(() => ({ tracked: false })),
};


