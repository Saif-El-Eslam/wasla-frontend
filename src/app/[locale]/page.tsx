import { PublicLandingPage } from '@/features/public/menu/components/venue/public-landing-page';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PublicLandingPage locale={locale === 'ar' ? 'ar' : 'en'} />;
}
