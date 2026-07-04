'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TabLoader } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { useFinancialAnalytics } from '../hooks/use-financial';
import { formatFinanceAmount, summaryTone } from '../utils/financial-format';
import { MetricTile } from './finance-ui';

export function AnalyticsPanel({ locale, currency }: { locale: string; currency: string }) {
  const t = useTranslations('dashboard');
  const [groupBy, setGroupBy] = useState('day');
  const analytics = useFinancialAnalytics({ groupBy });
  const summary = analytics.data?.analytics.summary;
  const groups = analytics.data?.analytics.groups ?? [];

  if (analytics.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['day', 'week', 'month', 'branch', 'category', 'paymentMethod'].map((item) => (
          <button
            key={item}
            type="button"
            className={`h-9 rounded-xl border px-3 text-xs font-black ${groupBy === item ? 'border-primary bg-teal-50 text-primary' : 'border-stone-200 bg-white text-stone-600'}`}
            onClick={() => setGroupBy(item)}
          >
            {t(`financeGroup_${item}`)}
          </button>
        ))}
      </div>

      {summary ? (
        <div className="grid gap-2 sm:gap-3 grid-cols-3">
          <MetricTile
            title={t('income')}
            value={formatFinanceAmount(summary.income, currency)}
            tone="text-emerald-700"
          />
          <MetricTile
            title={t('expense')}
            value={formatFinanceAmount(summary.expenses, currency)}
            tone="text-red-700"
          />
          <MetricTile
            title={t('net')}
            value={formatFinanceAmount(summary.net, currency)}
            tone={summaryTone(summary)}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.key} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-black text-stone-950">{textForLocale(group.label, locale) || group.key}</p>
              <p className={`font-black ${summaryTone(group)}`}>{formatFinanceAmount(group.net, currency)}</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <span className="text-sm font-bold text-emerald-700">
                {t('income')}: {formatFinanceAmount(group.income, currency)}
              </span>
              <span className="text-sm font-bold text-red-700">
                {t('expense')}: {formatFinanceAmount(group.expenses, currency)}
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {t('transactions')}: {group.count}
              </span>
            </div>
          </div>
        ))}
        {!analytics.isLoading && groups.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">
            {t('noReportResults')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
