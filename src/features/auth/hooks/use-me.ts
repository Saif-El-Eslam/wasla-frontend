'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useMe(options: { enabled?: boolean } = {}) {
  const params = useParams<{ locale: string }>();
  const locale = params.locale === 'ar' ? 'ar' : 'en';

  return useQuery({
    queryKey: [...queryKeys.me, locale] as const,
    queryFn: api.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
}
