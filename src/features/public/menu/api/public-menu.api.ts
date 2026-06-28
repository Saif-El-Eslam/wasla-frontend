import type {
  ApiEnvelope,
  PublicAnalyticsEventInput,
  PublicBranchMenuResponse,
  PublicVenueListResponse,
  PublicVenueResponse,
} from '@/lib/api';
import { toQueryString } from '@/lib/api';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function publicApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const publicMenuApi = {
  venues: (params: { page?: number; limit?: number; search?: string; type?: string }) =>
    publicApi<PublicVenueListResponse>(
      `/public/venues${toQueryString({
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        search: params.search || undefined,
        type: params.type && params.type !== 'ALL' ? params.type : undefined,
      })}`,
    ),
  venue: (venueSlug: string) => publicApi<PublicVenueResponse>(`/public/venues/${venueSlug}`),
  branchMenu: (venueSlug: string, branchSlug: string) =>
    publicApi<PublicBranchMenuResponse>(`/public/venues/${venueSlug}/${branchSlug}/menu`),
  track: (input: PublicAnalyticsEventInput) =>
    publicApi<{ tracked: boolean }>('/public/analytics', {
      method: 'POST',
      body: JSON.stringify(input),
      keepalive: true,
    }).catch(() => ({ tracked: false })),
};
