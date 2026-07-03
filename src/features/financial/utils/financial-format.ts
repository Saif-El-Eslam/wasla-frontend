import { formatMoney } from '@/features/dashboard/utils/dashboard-utils';
import type { FinanceSummary } from '../types/financial.types';

export function formatFinanceAmount(value: string | number | null | undefined, currency = 'EGP') {
  return formatMoney(value, currency, '0');
}

export function summaryTone(summary: FinanceSummary) {
  if (summary.net > 0) {
    return 'text-emerald-700';
  }

  if (summary.net < 0) {
    return 'text-red-700';
  }

  return 'text-stone-700';
}
