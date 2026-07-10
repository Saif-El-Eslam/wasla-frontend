import { PublicMenuExperience } from '@/features/public/components/menu/public-menu-experience';
import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { publicHref } from '@/features/public/utils/public-url';

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string; branchSlug: string }>;
}) {
  const { locale, venueSlug, branchSlug } = await params;
  const resolvedLocale = locale === 'ar' ? 'ar' : 'en';
  const nextLocale = resolvedLocale === 'ar' ? 'en' : 'ar';
  const data = await publicMenuApi.branchMenu(venueSlug, branchSlug, resolvedLocale);

  return (
    <PublicMenuExperience
      venue={data.venue}
      branch={data.branch}
      menu={data.menu}
      locale={resolvedLocale}
      currency={data.venue.currency}
      analyticsEnabled
      backHref={publicHref(resolvedLocale, `venues/${venueSlug}/branches`)}
      languageHref={publicHref(nextLocale, `venues/${venueSlug}/${branchSlug}/menu`)}
    />
  );
}