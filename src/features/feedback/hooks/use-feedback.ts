'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type GuestFeedbackStatus } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

const tabStaleTime = 60 * 1000;

export function useFeedbackDashboard(options: {
  branchId?: string;
  rating?: number;
  status?: GuestFeedbackStatus;
  issueOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.feedbackDashboard(options),
    queryFn: () => api.feedbackDashboard(options),
    staleTime: tabStaleTime,
    retry: false,
  });
}
