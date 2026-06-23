import { apiClient, toQueryString } from '../client';
import type { AnalyticsSummary } from '../types';

export const analyticsService = {
  summary: (options: { period: '7d' | '30d'; branchId?: string }) =>
    apiClient<{ analytics: AnalyticsSummary }>(
      `/analytics${toQueryString({
        period: options.period,
        branchId: options.branchId,
      })}`,
    ).then((data) => data.analytics),
};
