import type { BranchOption, LocalizedValue, MenuPlanCode, PaginationMeta, SubscriptionStatus } from '@/lib/api';

export type FinancialTransactionType = 'IN' | 'OUT';

export type FinanceAllowance = {
  canUseFinance: boolean;
  canUseAdvancedFinanceAnalytics: boolean;
  historyMonths: 3 | 12;
  subscriptionStatus: SubscriptionStatus;
  plan: MenuPlanCode;
};

export type TransactionCategory = {
  id: string;
  venueId: string;
  type: FinancialTransactionType;
  name: LocalizedValue;
  description: LocalizedValue | null;
  systemKey: string | null;
  sortOrder: number;
  active: boolean;
  deletedAt: string | null;
  transactionCount?: number;
};

export type PaymentMethod = {
  id: string;
  venueId: string;
  name: LocalizedValue;
  kind: 'CASH' | 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'DELIVERY_APP' | 'OTHER' | string | null;
  systemKey: string | null;
  sortOrder: number;
  active: boolean;
  deletedAt: string | null;
  transactionCount?: number;
};

export type FinancialTransaction = {
  id: string;
  venueId: string;
  branchId: string;
  type: FinancialTransactionType;
  categoryId: string;
  paymentMethodId: string | null;
  amount: string | number;
  currency: string;
  occurredAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  branch: BranchOption;
  category: TransactionCategory;
  paymentMethod: PaymentMethod | null;
};

export type FinanceSummary = {
  income: number;
  expenses: number;
  net: number;
  count: number;
};

export type FinanceAccessResponse = {
  allowance: FinanceAllowance;
  isAdmin: boolean;
  timeZone: string;
};

export type FinanceDashboardResponse = {
  dashboard: {
    allowance: FinanceAllowance;
    branches: BranchOption[];
    today: FinanceSummary;
    month: FinanceSummary;
    recentTransactions: FinancialTransaction[];
    insights: Array<{ tone: 'good' | 'warning' | 'neutral'; key: string; value?: number }>;
  };
};

export type FinancialTransactionsResponse = {
  transactions: FinancialTransaction[];
  pagination: PaginationMeta;
};

export type TransactionCategoriesResponse = {
  categories: TransactionCategory[];
};

export type PaymentMethodsResponse = {
  paymentMethods: PaymentMethod[];
};

export type FinancialAnalyticsResponse = {
  analytics: {
    allowance: FinanceAllowance;
    summary: FinanceSummary;
    groups: Array<{ key: string; label: LocalizedValue | string; income: number; expenses: number; net: number; count: number }>;
  };
};

export type FinancialReportResponse = {
  report: {
    allowance: FinanceAllowance;
    summary: FinanceSummary;
    byCategory: Array<{ categoryId: string; name: LocalizedValue; type: FinancialTransactionType; amount: number; count: number }>;
    byBranch: Array<{ branchId: string; name: LocalizedValue; income: number; expenses: number; net: number; count: number }>;
    byPaymentMethod: Array<{ paymentMethodId: string | null; name: LocalizedValue; income: number; expenses: number; net: number; count: number }>;
    transactionCount: number;
  };
};

export type FinancialFilters = {
  branchId?: string;
  from?: string;
  to?: string;
  type?: FinancialTransactionType;
  categoryId?: string;
  paymentMethodId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateFinancialTransactionInput = {
  type: FinancialTransactionType;
  branchId: string;
  categoryId: string;
  paymentMethodId?: string | null;
  amount: number;
  occurredAt: string;
  note?: string;
};

export type UpdateFinancialTransactionInput = Partial<CreateFinancialTransactionInput>;

export type CreateTransactionCategoryInput = {
  type: FinancialTransactionType;
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  active?: boolean;
  sortOrder?: number;
};

export type UpdateTransactionCategoryInput = Partial<CreateTransactionCategoryInput>;

export type CreatePaymentMethodInput = {
  name: { en: string; ar: string };
  kind?: 'CASH' | 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'DELIVERY_APP' | 'OTHER';
  active?: boolean;
  sortOrder?: number;
};

export type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>;
