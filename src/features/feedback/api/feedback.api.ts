import { apiClient, toQueryString } from '@/lib/api/axios';
import type { FeedbackDashboardResponse, GuestFeedbackStatus } from '@/lib/api/types';

export const feedbackService = {
  dashboard: (
    options: {
      branchId?: string;
      rating?: number;
      status?: GuestFeedbackStatus;
      issueOnly?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ) =>
    apiClient<FeedbackDashboardResponse>(
      `/feedback${toQueryString({
        branchId: options.branchId,
        rating: options.rating,
        status: options.status,
        issueOnly: options.issueOnly,
        page: options.page,
        limit: options.limit,
      })}`,
    ),
  updateStatus: (feedbackId: string, status: GuestFeedbackStatus) =>
    apiClient<{ feedback: FeedbackDashboardResponse['feedback'][number] }>(`/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
