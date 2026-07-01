'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/features/auth/hooks/use-me';
import { postAuthDestination } from '@/features/auth/utils/auth-redirect';
import { queryKeys } from '@/lib/api/query-keys';

function isStandaloneApp() {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

export function AuthSessionRedirect({
  locale,
  standaloneOnly = false,
}: {
  locale: string;
  standaloneOnly?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(!standaloneOnly);
  const me = useMe({ enabled });

  useEffect(() => {
    if (!standaloneOnly) {
      return;
    }

    setEnabled(isStandaloneApp());
  }, [standaloneOnly]);

  useEffect(() => {
    if (!me.data) {
      return;
    }

    queryClient.setQueryData(queryKeys.me, me.data);
    router.replace(postAuthDestination(me.data, locale));
  }, [locale, me.data, queryClient, router]);

  return null;
}
