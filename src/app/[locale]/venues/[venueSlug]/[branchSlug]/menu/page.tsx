import { notFound } from 'next/navigation';
import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { PublicMenuExperience } from '@/features/public/components/menu/public-menu-experience';

export default async function PublicBranchMenuPage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string; branchSlug: string }>;
}) {
  const { locale, venueSlug, branchSlug } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';

  try {
    const menuData = await publicMenuApi.branchMenu(venueSlug, branchSlug, resolvedLocale);
    const nextLocale = resolvedLocale === 'ar' ? 'en' : 'ar';

    return (
      <PublicMenuExperience
        venue={menuData.venue}
        branch={menuData.branch}
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
