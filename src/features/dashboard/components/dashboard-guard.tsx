'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/features/auth/hooks/use-me';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const pathname = usePathname();
  const router = useRouter();

  const isSetupPage = pathname.endsWith('/dashboard/setup');

  useEffect(() => {
    if (isLoading || !me) return;

    const hasVenue = !!me.venueId;

    if (!hasVenue && !isSetupPage) {
      router.replace('/en/dashboard/setup');
      return;
    }

    if (hasVenue && isSetupPage) {
      router.replace('/en/dashboard');
    }
  }, [isLoading, me, pathname, router]);

  if (isLoading) {
    return null; // or a full-page loader
  }

  return children;
}
