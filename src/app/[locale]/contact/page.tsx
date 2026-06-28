import { PublicInfoPage } from '@/features/public/menu/components/venue/public-info-page';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <PublicInfoPage locale={locale === 'ar' ? 'ar' : 'en'} pageKey="contact" />;
}
