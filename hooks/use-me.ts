'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/lib/query-keys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: api.me,
  });
}
