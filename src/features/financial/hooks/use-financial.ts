'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../api/financial.api';
import type {
  CreateFinancialTransactionInput,
  CreatePaymentMethodInput,
  CreateTransactionCategoryInput,
  FinancialFilters,
  UpdateFinancialTransactionInput,
  UpdatePaymentMethodInput,
  UpdateTransactionCategoryInput,
} from '../types/financial.types';

const financeStaleTime = 60 * 1000;

export const financialQueryKeys = {
  access: ['finance', 'access'] as const,
  dashboard: (filters?: Record<string, unknown>) => ['finance', 'dashboard', filters ?? {}] as const,
  transactions: (filters?: Record<string, unknown>) => ['finance', 'transactions', filters ?? {}] as const,
  categories: (filters?: Record<string, unknown>) => ['finance', 'categories', filters ?? {}] as const,
  paymentMethods: (filters?: Record<string, unknown>) => ['finance', 'payment-methods', filters ?? {}] as const,
  analytics: (filters?: Record<string, unknown>) => ['finance', 'analytics', filters ?? {}] as const,
  report: (filters?: Record<string, unknown>) => ['finance', 'report', filters ?? {}] as const,
};

function useInvalidateFinance() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['finance'] });
  };
}

export function useFinanceAccess() {
  return useQuery({
    queryKey: financialQueryKeys.access,
    queryFn: financialService.access,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useFinanceDashboard(filters: FinancialFilters = {}, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.dashboard(filters),
    queryFn: () => financialService.dashboard(filters),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useFinancialTransactions(filters: FinancialFilters = {}, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.transactions(filters),
    queryFn: () => financialService.transactions(filters),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useInfiniteFinancialTransactions(filters: FinancialFilters = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: financialQueryKeys.transactions({ ...filters, infinite: true }),
    queryFn: ({ pageParam }) => financialService.transactions({ ...filters, page: pageParam }),
    initialPageParam: filters.page ?? 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useTransactionCategories(type?: 'IN' | 'OUT', includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.categories({ type, includeInactive }),
    queryFn: () => financialService.categories({ type, includeInactive }),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function usePaymentMethods(includeInactive = false, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.paymentMethods({ includeInactive }),
    queryFn: () => financialService.paymentMethods({ includeInactive }),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useFinancialAnalytics(filters: FinancialFilters & { groupBy?: string } = {}, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.analytics(filters),
    queryFn: () => financialService.analytics(filters),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useFinancialReport(filters: FinancialFilters = {}, enabled = true) {
  return useQuery({
    queryKey: financialQueryKeys.report(filters),
    queryFn: () => financialService.report(filters),
    enabled,
    staleTime: financeStaleTime,
    retry: false,
  });
}

export function useCreateFinancialTransaction() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: (input: CreateFinancialTransactionInput) => financialService.createTransaction(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFinancialTransaction() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: ({ transactionId, input }: { transactionId: string; input: UpdateFinancialTransactionInput }) =>
      financialService.updateTransaction(transactionId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteFinancialTransaction() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: financialService.deleteTransaction,
    onSuccess: invalidate,
  });
}

export function useCreateTransactionCategory() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: (input: CreateTransactionCategoryInput) => financialService.createCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTransactionCategory() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: UpdateTransactionCategoryInput }) =>
      financialService.updateCategory(categoryId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransactionCategory() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: financialService.deleteCategory,
    onSuccess: invalidate,
  });
}

export function useCreatePaymentMethod() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: (input: CreatePaymentMethodInput) => financialService.createPaymentMethod(input),
    onSuccess: invalidate,
  });
}

export function useUpdatePaymentMethod() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: ({ paymentMethodId, input }: { paymentMethodId: string; input: UpdatePaymentMethodInput }) =>
      financialService.updatePaymentMethod(paymentMethodId, input),
    onSuccess: invalidate,
  });
}

export function useDeletePaymentMethod() {
  const invalidate = useInvalidateFinance();

  return useMutation({
    mutationFn: financialService.deletePaymentMethod,
    onSuccess: invalidate,
  });
}
