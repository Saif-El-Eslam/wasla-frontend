import { apiClient, toQueryString } from '@/lib/api/axios';
import type {
  Branch,
  BranchListResponse,
  BranchManagementResponse,
  BranchOptionsResponse,
  BranchOverviewResponse,
  BranchQrResponse,
  CreateBranchInput,
  ListQueryOptions,
  UpdateBranchInput,
} from '@/lib/api/types';

export const branchService = {
  branches: (options: ListQueryOptions = {}) =>
    apiClient<BranchListResponse>(
      `/branches${toQueryString({
        paginate: options.paginate,
        page: options.page,
        limit: options.limit,
        search: options.search,
        view: options.view,
      })}`,
    ),
  branchOptions: () => apiClient<BranchOptionsResponse>('/branches?view=options'),
  branchManagement: () => apiClient<BranchManagementResponse>('/branches?view=management'),
  branchOverview: () => apiClient<BranchOverviewResponse>('/branches/overview'),
  branchQr: (branchId: string) => apiClient<BranchQrResponse>(`/branches/${branchId}/qr`),
  branch: (branchId: string) =>
    apiClient<{ branch: Branch }>(`/branches/${branchId}`).then((data) => data.branch),
  createBranch: (input: CreateBranchInput) =>
    apiClient<{ branch: Branch }>('/branches', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateBranch: (branchId: string, input: UpdateBranchInput) =>
    apiClient<{ branch: Branch }>(`/branches/${branchId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  setMainBranch: (branchId: string) =>
    apiClient<{ branch: Branch }>(`/branches/${branchId}/set-main`, {
      method: 'POST',
    }),
  deleteBranch: (branchId: string) =>
    apiClient<{ deleted: boolean }>(`/branches/${branchId}`, {
      method: 'DELETE',
    }),
};
