import { AdminSubscriptionsPage } from '@/features/admin/components/admin-subscriptions-page';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return <AdminSubscriptionsPage locale={locale} />;
}
