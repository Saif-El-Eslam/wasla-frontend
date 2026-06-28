import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { PublicVenuesBrowser } from '@/features/public/menu/components/venue/public-venues-browser';

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
  const initialData = await publicMenuApi.venues({
    page: 1,
    limit: 12,
    search,
    type,
  });

  return (
    <PublicVenuesBrowser
      initialData={initialData}
      locale={resolvedLocale}
      initialSearch={search}
      initialType={type}
    />
  );
}
