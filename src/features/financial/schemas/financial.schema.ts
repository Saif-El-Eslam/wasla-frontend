import { z } from 'zod';

export const financialTransactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  branchId: z.string().min(1),
  categoryId: z.string().min(1),
  paymentMethodId: z.string().optional(),
  amount: z.coerce.number().positive().max(99999999.99),
  occurredAt: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

export const financeConfigSchema = z.object({
  type: z.enum(['IN', 'OUT']).optional(),
  nameEn: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().min(1).max(120),
  active: z.boolean().default(true),
});

export type FinancialTransactionFormValues = z.infer<typeof financialTransactionSchema>;
export type FinanceConfigFormValues = z.infer<typeof financeConfigSchema>;
