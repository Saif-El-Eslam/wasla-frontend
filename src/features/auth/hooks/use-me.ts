'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: api.me,
  });
}
