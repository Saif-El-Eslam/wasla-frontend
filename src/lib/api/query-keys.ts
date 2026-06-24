export const queryKeys = {
  me: ['auth', 'me'] as const,
  venue: ['venue'] as const,
  users: ['users'] as const,
  branches: ['branches'] as const,
  branchOptions: ['branches', 'options'] as const,
  branchManagement: ['branches', 'management'] as const,
  branchOverview: ['branches', 'overview'] as const,
  branch: (branchId: string) => ['branch', branchId] as const,
  branchMenu: (branchId: string) => ['branch', branchId, 'menu'] as const,
  branchQr: (branchId: string) => ['branch', branchId, 'qr'] as const,
  extraction: (branchId: string, menuId: string, jobId?: string) =>
    ['branch', branchId, 'menu', menuId, 'extraction', jobId ?? 'latest'] as const,
  qr: (branchId: string, menuId: string) => ['branch', branchId, 'menu', menuId, 'qr'] as const,
  analytics: (branchId: string, filters?: Record<string, unknown>) =>
    ['branch', branchId, 'analytics', filters ?? {}] as const,
  analyticsSummary: (filters?: Record<string, unknown>) => ['analytics', 'summary', filters ?? {}] as const,
};
