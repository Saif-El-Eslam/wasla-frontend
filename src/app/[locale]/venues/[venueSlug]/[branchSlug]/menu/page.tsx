import { notFound } from 'next/navigation';
import { publicMenuApi } from '@/features/public/menu/api/public-menu.api';
import { PublicMenuExperience } from '@/features/public/menu/components/menu/public-menu-experience';

export default async function PublicBranchMenuPage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string; branchSlug: string }>;
}) {
  const { locale, venueSlug, branchSlug } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';

  try {
    const [menuData, venueData] = await Promise.all([
      publicMenuApi.branchMenu(venueSlug, branchSlug),
      publicMenuApi.venue(venueSlug),
    ]);
    const nextLocale = resolvedLocale === 'ar' ? 'en' : 'ar';

    return (
      <PublicMenuExperience
        venue={menuData.venue}
        branch={menuData.branch}
        branches={venueData.branches}
        menu={menuData.menu}
        locale={resolvedLocale}
        currency={menuData.venue.currency}
        analyticsEnabled
        backHref={`/${resolvedLocale}/venues/${venueSlug}/branches`}
        languageHref={`/${nextLocale}/venues/${venueSlug}/${branchSlug}/menu`}
      />
    );
  } catch {
    notFound();
  }
}
