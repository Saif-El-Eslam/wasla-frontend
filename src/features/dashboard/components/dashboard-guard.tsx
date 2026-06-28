'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/features/auth/hooks/use-me';
import { currentBrowserLocale } from '@/lib/i18n/locale-detection';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const pathname = usePathname();
  const router = useRouter();

  const isSetupPage = pathname.endsWith('/dashboard/setup');

  useEffect(() => {
    if (isLoading || !me) return;

    const hasVenue = !!me.venueId;
    const locale = currentBrowserLocale(pathname);

    if (!hasVenue && !isSetupPage) {
      router.replace(`/${locale}/dashboard/setup`);
      return;
    }

    if (hasVenue && isSetupPage) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isLoading, me, pathname, router]);

  if (isLoading) {
    return null; // or a full-page loader
  }

  return children;
}
