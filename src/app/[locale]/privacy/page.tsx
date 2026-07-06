import { PublicInfoPage } from '@/features/public/components/venue/public-info-page';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <PublicInfoPage locale={locale === 'ar' ? 'ar' : 'en'} pageKey="privacy" />;
}
