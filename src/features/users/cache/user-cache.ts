import type { QueryClient } from '@tanstack/react-query';
import type { CurrentUser } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

export function setCurrentUserInCache(queryClient: QueryClient, user: CurrentUser) {
  queryClient.setQueryData(queryKeys.me, user);
}

export function invalidateVenueUsersCache(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.users });
}
