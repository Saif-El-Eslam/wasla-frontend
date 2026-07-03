import { apiClient, toQueryString } from '@/lib/api/axios';
import type {
  CreateFinancialTransactionInput,
  CreatePaymentMethodInput,
  CreateTransactionCategoryInput,
  FinanceAccessResponse,
  FinanceDashboardResponse,
  FinancialAnalyticsResponse,
  FinancialFilters,
  FinancialReportResponse,
  FinancialTransaction,
  FinancialTransactionsResponse,
  PaymentMethod,
  PaymentMethodsResponse,
  TransactionCategoriesResponse,
  TransactionCategory,
  UpdateFinancialTransactionInput,
  UpdatePaymentMethodInput,
  UpdateTransactionCategoryInput,
} from '../types/financial.types';

function financeQuery(filters: FinancialFilters = {}) {
  return toQueryString({
    branchId: filters.branchId,
    from: filters.from,
    to: filters.to,
    type: filters.type,
    categoryId: filters.categoryId,
    paymentMethodId: filters.paymentMethodId,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  });
}

export const financialService = {
  access: () => apiClient<FinanceAccessResponse>('/financial/access'),
  dashboard: (filters: FinancialFilters = {}) => apiClient<FinanceDashboardResponse>(`/financial/dashboard${financeQuery(filters)}`),
  transactions: (filters: FinancialFilters = {}) => apiClient<FinancialTransactionsResponse>(`/financial/transactions${financeQuery(filters)}`),
  transaction: (transactionId: string) =>
    apiClient<{ transaction: FinancialTransaction }>(`/financial/transactions/${transactionId}`),
  createTransaction: (input: CreateFinancialTransactionInput) =>
    apiClient<{ transaction: FinancialTransaction }>('/financial/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTransaction: (transactionId: string, input: UpdateFinancialTransactionInput) =>
    apiClient<{ transaction: FinancialTransaction }>(`/financial/transactions/${transactionId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTransaction: (transactionId: string) =>
    apiClient<{ deleted: boolean }>(`/financial/transactions/${transactionId}`, {
      method: 'DELETE',
    }),
  categories: (options: { type?: 'IN' | 'OUT'; includeInactive?: boolean } = {}) =>
    apiClient<TransactionCategoriesResponse>(
      `/financial/categories${toQueryString({ type: options.type, includeInactive: options.includeInactive })}`,
    ),
  createCategory: (input: CreateTransactionCategoryInput) =>
    apiClient<{ category: TransactionCategory }>('/financial/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateCategory: (categoryId: string, input: UpdateTransactionCategoryInput) =>
    apiClient<{ category: TransactionCategory }>(`/financial/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteCategory: (categoryId: string) =>
    apiClient<{ deleted: boolean }>(`/financial/categories/${categoryId}`, {
      method: 'DELETE',
    }),
  paymentMethods: (options: { includeInactive?: boolean } = {}) =>
    apiClient<PaymentMethodsResponse>(
      `/financial/payment-methods${toQueryString({ includeInactive: options.includeInactive })}`,
    ),
  createPaymentMethod: (input: CreatePaymentMethodInput) =>
    apiClient<{ paymentMethod: PaymentMethod }>('/financial/payment-methods', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updatePaymentMethod: (paymentMethodId: string, input: UpdatePaymentMethodInput) =>
    apiClient<{ paymentMethod: PaymentMethod }>(`/financial/payment-methods/${paymentMethodId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deletePaymentMethod: (paymentMethodId: string) =>
    apiClient<{ deleted: boolean }>(`/financial/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    }),
  analytics: (filters: FinancialFilters & { groupBy?: string } = {}) =>
    apiClient<FinancialAnalyticsResponse>(
      `/financial/analytics${toQueryString({ ...filters, branchId: filters.branchId, groupBy: filters.groupBy })}`,
    ),
  report: (filters: FinancialFilters = {}) =>
    apiClient<FinancialReportResponse>(`/financial/reports/summary${financeQuery(filters)}`),
};
