import type { QueryClient } from '@tanstack/react-query';
import type { BranchManagement, BranchOptionsResponse } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

function invalidateBranchDetailCaches(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.branchManagement });
  void queryClient.invalidateQueries({ queryKey: queryKeys.branchOverview });
}

export function addBranchToCaches(queryClient: QueryClient, branch: BranchManagement) {
  queryClient.setQueriesData<BranchOptionsResponse>({ queryKey: queryKeys.branchOptions }, (current) =>
    current
      ? {
          ...current,
          branches: current.branches.some((item) => item.id === branch.id)
            ? current.branches.map((item) =>
                item.id === branch.id
                  ? {
                      id: branch.id,
                      name: branch.name,
                      slug: branch.slug,
                      active: branch.active,
                      isMain: branch.isMain,
                    }
                  : item,
              )
            : [
                {
                  id: branch.id,
                  name: branch.name,
                  slug: branch.slug,
                  active: branch.active,
                  isMain: branch.isMain,
                },
                ...current.branches,
              ],
        }
      : current,
  );

  invalidateBranchDetailCaches(queryClient);
}

export function updateBranchCaches(
  queryClient: QueryClient,
  branchId: string,
  patch: Partial<BranchManagement>,
) {
  queryClient.setQueriesData<BranchOptionsResponse>({ queryKey: queryKeys.branchOptions }, (current) =>
    current
      ? {
          ...current,
          branches: current.branches.map((branch) =>
            branch.id === branchId
              ? {
                  ...branch,
                  name: patch.name ?? branch.name,
                  slug: patch.slug ?? branch.slug,
                  active: patch.active ?? branch.active,
                  isMain: patch.isMain ?? branch.isMain,
                }
              : branch,
          ),
        }
      : current,
  );

  invalidateBranchDetailCaches(queryClient);
}

export function setMainBranchInCaches(queryClient: QueryClient, branchId: string) {
  queryClient.setQueriesData<BranchOptionsResponse>({ queryKey: queryKeys.branchOptions }, (current) =>
    current
      ? {
          ...current,
          branches: current.branches.map((branch) => ({
            ...branch,
            isMain: branch.id === branchId,
            active: branch.id === branchId ? true : branch.active,
          })),
        }
      : current,
  );

  invalidateBranchDetailCaches(queryClient);
}

export function removeBranchFromCaches(queryClient: QueryClient, branchId: string) {
  queryClient.setQueriesData<BranchOptionsResponse>({ queryKey: queryKeys.branchOptions }, (current) =>
    current
      ? {
          ...current,
          branches: current.branches.filter((branch) => branch.id !== branchId),
        }
      : current,
  );

  invalidateBranchDetailCaches(queryClient);
}
