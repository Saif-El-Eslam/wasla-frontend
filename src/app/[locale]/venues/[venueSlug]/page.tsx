import { redirect } from 'next/navigation';
import { publicHref } from '@/features/public/utils/public-url';

export default async function PublicVenuePage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string }>;
}) {
  const { locale, venueSlug } = await params;

  redirect(publicHref(locale, `venues/${venueSlug}/branches`));
}