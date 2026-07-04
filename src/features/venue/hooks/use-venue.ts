'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

const tabStaleTime = 5 * 60 * 1000;

function useLocale() {
  const params = useParams<{ locale: string }>();
  return params.locale === 'ar' ? 'ar' : 'en';
}

export function useVenue() {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.venue, locale] as const,
    queryFn: api.myVenue,
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useBranches(options: { paginate?: boolean; page?: number; limit?: number; search?: string } = {}) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branches, locale, options] as const,
    queryFn: () => api.branches(options),
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useBranchOptions(enabled = true) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branchOptions, locale] as const,
    queryFn: api.branchOptions,
    enabled,
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useBranchOverview() {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branchOverview, locale] as const,
    queryFn: api.branchOverview,
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useBranchManagement() {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branchManagement, locale] as const,
    queryFn: api.branchManagement,
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useBranchMenu(branchId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branchMenu(branchId), locale] as const,
    queryFn: () => api.branchMenu(branchId),
    enabled: Boolean(branchId),
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useLatestExtractionJob(branchId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.extraction(branchId, 'latest'), locale] as const,
    queryFn: () => api.latestExtractionJob(branchId),
    enabled: Boolean(branchId),
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;

      return status === 'PENDING' || status === 'PROCESSING' ? 5000 : false;
    },
    retry: false,
  });
}

export function useExtractionJob(branchId: string, jobId?: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.extraction(branchId, 'current', jobId), locale] as const,
    queryFn: () => api.extractionJob(branchId, jobId ?? ''),
    enabled: Boolean(branchId && jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;

      return status === 'PENDING' || status === 'PROCESSING' ? 5000 : false;
    },
    retry: false,
  });
}

export function useBranchQr(branchId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.branchQr(branchId), locale] as const,
    queryFn: () => api.branchQr(branchId),
    enabled: Boolean(branchId),
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useRegenerateBranchQr(branchId: string) {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.regenerateBranchQr(branchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...queryKeys.branchQr(branchId), locale] });
    },
  });
}

export function useAnalyticsSummary(options: { period?: '7d' | '30d'; from?: string; to?: string; branchId?: string }) {
  const locale = useLocale();

  return useQuery({
    queryKey: [...queryKeys.analyticsSummary({ ...options, locale })] as const,
    queryFn: () => api.analyticsSummary(options),
    staleTime: tabStaleTime,
    retry: false,
  });
}

export function useUsers(
  options: { paginate?: boolean; page?: number; limit?: number; search?: string; enabled?: boolean } = {},
) {
  const locale = useLocale();
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: [...queryKeys.users, locale, queryOptions] as const,
    queryFn: () => api.users(queryOptions),
    enabled,
    staleTime: tabStaleTime,
    retry: false,
  });
}
