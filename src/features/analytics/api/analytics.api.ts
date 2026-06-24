import { apiClient, toQueryString } from '@/lib/api/axios';
import type { AnalyticsSummary } from '@/lib/api/types';

export const analyticsService = {
  summary: (options: { period: '7d' | '30d'; branchId?: string }) =>
    apiClient<{ analytics: AnalyticsSummary }>(
      `/analytics${toQueryString({
        period: options.period,
        branchId: options.branchId,
      })}`,
    ).then((data) => data.analytics),
};
