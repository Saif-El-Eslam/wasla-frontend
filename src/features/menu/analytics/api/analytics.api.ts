import { apiClient, toQueryString } from '@/lib/api/axios';
import type { AnalyticsSummary } from '@/lib/api/types';

export const analyticsService = {
  summary: (options: { period?: '7d' | '30d'; from?: string; to?: string; branchId?: string }) =>
    apiClient<{ analytics: AnalyticsSummary }>(
      `/analytics${toQueryString({
        period: options.period,
        from: options.from,
        to: options.to,
        branchId: options.branchId,
      })}`,
    ).then((data) => data.analytics),
};
