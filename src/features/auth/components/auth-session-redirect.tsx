'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/features/auth/hooks/use-me';
import { postAuthDestination } from '@/features/auth/utils/auth-redirect';
import {
  markPublicNavigationFromUrl,
  isIntentionalPublicNavigation,
} from '@/features/auth/utils/pwa-public-navigation';
import { queryKeys } from '@/lib/api/query-keys';

function isStandaloneApp() {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
  );
}

export function AuthSessionRedirect({
  locale,
  launchOnly = false,
  standaloneOnly = false,
}: {
  locale: string;
  launchOnly?: boolean;
  standaloneOnly?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const me = useMe({ enabled });

  useEffect(() => {
    if (standaloneOnly && !isStandaloneApp()) {
      setEnabled(false);
      return;
    }

    markPublicNavigationFromUrl(searchParams);
    setEnabled(!launchOnly || !isIntentionalPublicNavigation());
  }, [launchOnly, standaloneOnly]);

  useEffect(() => {
    if (!enabled || !me.data) {
      return;
    }

    queryClient.setQueryData(queryKeys.me, me.data);
    router.replace(postAuthDestination(me.data, locale));
  }, [enabled, locale, me.data, queryClient, router]);

  return null;
}
