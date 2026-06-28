import { PublicInfoPage } from '@/features/public/menu/components/venue/public-info-page';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <PublicInfoPage locale={locale === 'ar' ? 'ar' : 'en'} pageKey="terms" />;
}
