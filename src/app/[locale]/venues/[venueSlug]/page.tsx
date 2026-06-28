import { redirect } from 'next/navigation';

export default async function PublicVenuePage({
  params,
}: {
  params: Promise<{ locale: string; venueSlug: string }>;
}) {
  const { locale, venueSlug } = await params;
  redirect(`/${locale}/venues/${venueSlug}/branches`);
}
