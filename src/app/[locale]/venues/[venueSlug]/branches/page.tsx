import { notFound } from 'next/navigation';
import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { PublicBranchesView } from '@/features/public/menu/components/branch/public-branches-view';

export default async function PublicBranchesPage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string }>;
}) {
  const { locale, venueSlug } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';

  try {
    const data = await publicMenuApi.venue(venueSlug);
    return <PublicBranchesView venue={data.venue} branches={data.branches} locale={resolvedLocale} />;
  } catch {
    notFound();
  }
}
