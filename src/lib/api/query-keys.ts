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
  financeAccess: ['finance', 'access'] as const,
  financeDashboard: (filters?: Record<string, unknown>) => ['finance', 'dashboard', filters ?? {}] as const,
  financialTransactions: (filters?: Record<string, unknown>) => ['finance', 'transactions', filters ?? {}] as const,
  financialCategories: (filters?: Record<string, unknown>) => ['finance', 'categories', filters ?? {}] as const,
  financialPaymentMethods: (filters?: Record<string, unknown>) => ['finance', 'payment-methods', filters ?? {}] as const,
  financialAnalytics: (filters?: Record<string, unknown>) => ['finance', 'analytics', filters ?? {}] as const,
  financialReport: (filters?: Record<string, unknown>) => ['finance', 'report', filters ?? {}] as const,
  subscription: ['subscription'] as const,
  adminSubscriptionOverview: ['admin', 'subscriptions', 'overview'] as const,
  adminSubscriptionVenues: (filters?: Record<string, unknown>) =>
    ['admin', 'subscriptions', 'venues', filters ?? {}] as const,
  adminVerificationCodes: (filters?: Record<string, unknown>) =>
    ['admin', 'auth', 'verification-codes', filters ?? {}] as const,
  adminPlans: ['admin', 'subscriptions', 'plans'] as const,
  adminFeatures: ['admin', 'subscriptions', 'features'] as const,
};
