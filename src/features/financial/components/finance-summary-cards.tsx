'use client';

import { useTranslations } from 'next-intl';
import { formatFinanceAmount, summaryTone } from '../utils/financial-format';
import type { FinanceSummary } from '../types/financial.types';
import { MetricTile } from './finance-ui';

export function FinanceSummaryCards({
  today,
  month,
  currency,
}: {
  today: FinanceSummary;
  month: FinanceSummary;
  currency: string;
}) {
  const t = useTranslations('dashboard');

  return (
    <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
      <MetricTile
        title={t('todayIncome')}
        value={formatFinanceAmount(today.income, currency)}
        tone="text-emerald-700"
      />
      <MetricTile
        title={t('todayExpenses')}
        value={formatFinanceAmount(today.expenses, currency)}
        tone="text-red-700"
      />
      <MetricTile
        title={t('monthNet')}
        value={formatFinanceAmount(month.net, currency)}
        tone={summaryTone(month)}
      />
      <MetricTile title={t('transactions')} value={String(month.count)} />
    </div>
  );
}
