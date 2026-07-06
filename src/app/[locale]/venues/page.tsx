import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { PublicVenuesBrowser } from '@/features/public/components/venue/public-venues-browser';
import type { PublicVenueListResponse } from '@/lib/api';

type SearchParams = {
  search?: string;
  type?: string;
};

export default async function PublicVenuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';
  const search = typeof query.search === 'string' ? query.search : '';
  const type = typeof query.type === 'string' ? query.type : 'ALL';
  let initialData: PublicVenueListResponse;

  try {
    initialData = await publicMenuApi.venues({
      page: 1,
      limit: 12,
      search,
      type,
      locale: resolvedLocale,
    });
  } catch {
    initialData = {
      venues: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: {
        search,
        type: type === 'ALL' ? null : type,
      },
    };
  }

  return (
    <PublicVenuesBrowser
      initialData={initialData}
      locale={resolvedLocale}
      initialSearch={search}
      initialType={type}
    />
  );
}
