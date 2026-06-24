import { redirect } from 'next/navigation';

export default async function BranchPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale } = await params;

  redirect(`/${locale}/dashboard`);
}
