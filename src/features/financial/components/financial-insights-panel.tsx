'use client';

import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { QueryErrorState, TabLoader } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { useFinancialAnalytics, useFinancialReport } from '../hooks/use-financial';
import type { FinancialFilters } from '../types/financial.types';
import { formatFinanceAmount, summaryTone } from '../utils/financial-format';
import { MetricTile } from './finance-ui';

const axisStyle = { fontSize: 11, fontWeight: 800, fill: '#78716c' };
const gridStroke = '#e7e5e4';

type ChartDatum = {
  key: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
};

function financialGroupLabel(key: string, label: unknown, locale: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
      new Date(`${key}T12:00:00`),
    );
  }

  return textForLocale(label as Parameters<typeof textForLocale>[0], locale) || key;
}

function ChartCard({
  title,
  description,
  emptyLabel,
  data,
  currency,
  locale,
  layout = 'horizontal',
  labels,
}: {
  title: string;
  description: string;
  emptyLabel: string;
  data: ChartDatum[];
  currency: string;
  locale: string;
  layout?: 'horizontal' | 'vertical';
  labels: { income: string; expense: string; net: string };
}) {
  const compactAmount = (value: number) =>
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  return (
    <section className="min-w-0 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h4 className="font-black text-stone-950">{title}</h4>
      <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{description}</p>
      {data.length ? (
        <div
          className="mt-4 h-72 min-w-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50/70 p-2"
          role="img"
          aria-label={title}
        >
          <ResponsiveContainer width="100%" height="100%">
            {layout === 'vertical' ? (
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
                <CartesianGrid horizontal={false} stroke={gridStroke} strokeDasharray="6 10" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                  tickFormatter={compactAmount}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                  width={96}
                />
                <Tooltip formatter={(value) => formatFinanceAmount(Number(value), currency)} />
                <Bar name={labels.income} dataKey="income" fill="#059669" radius={[0, 8, 8, 0]} />
                <Bar name={labels.expense} dataKey="expenses" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            ) : (
              <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="6 10" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                  minTickGap={18}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                  tickFormatter={compactAmount}
                  width={44}
                />
                <Tooltip formatter={(value) => formatFinanceAmount(Number(value), currency)} />
                <Bar name={labels.income} dataKey="income" fill="#10b981" radius={[8, 8, 2, 2]} />
                <Bar name={labels.expense} dataKey="expenses" fill="#fb7185" radius={[8, 8, 2, 2]} />
                <Line
                  name={labels.net}
                  type="monotone"
                  dataKey="net"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 grid h-52 place-items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 text-center text-sm font-bold text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}

export function FinancialInsightsPanel({
  filters,
  currency,
  locale,
}: {
  filters: FinancialFilters;
  currency: string;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const analytics = useFinancialAnalytics({ ...filters, groupBy: 'day' });
  const report = useFinancialReport(filters);

  const dailyData = useMemo<ChartDatum[]>(
    () =>
      (analytics.data?.analytics.groups ?? []).map((group) => ({
        key: group.key,
        label: financialGroupLabel(group.key, group.label, locale),
        income: group.income,
        expenses: group.expenses,
        net: group.net,
      })),
    [analytics.data?.analytics.groups, locale],
  );

  const categoryData = useMemo<ChartDatum[]>(
    () =>
      [...(report.data?.report.byCategory ?? [])]
        .sort((left, right) => right.amount - left.amount)
        .slice(0, 6)
        .map((item) => ({
          key: item.categoryId,
          label: textForLocale(item.name, locale),
          income: item.type === 'IN' ? item.amount : 0,
          expenses: item.type === 'OUT' ? item.amount : 0,
          net: item.type === 'IN' ? item.amount : -item.amount,
        })),
    [locale, report.data?.report.byCategory],
  );

  const branchData = useMemo<ChartDatum[]>(
    () =>
      [...(report.data?.report.byBranch ?? [])]
        .sort((left, right) => Math.abs(right.net) - Math.abs(left.net))
        .slice(0, 6)
        .map((item) => ({
          key: item.branchId,
          label: textForLocale(item.name, locale),
          income: item.income,
          expenses: item.expenses,
          net: item.net,
        })),
    [locale, report.data?.report.byBranch],
  );

  if (analytics.isLoading || report.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (analytics.isError || report.isError) {
    return (
      <QueryErrorState
        onRetry={() => {
          void analytics.refetch();
          void report.refetch();
        }}
      />
    );
  }

  const summary = report.data?.report.summary;

  if (!summary?.count) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">
        {t('noFinancialInsights')}
      </p>
    );
  }

  const averageTransaction = (summary.income + summary.expenses) / summary.count;
  const netMargin = summary.income ? (summary.net / summary.income) * 100 : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
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
        <MetricTile title={t('transactions')} value={String(summary.count)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
          <p className="text-xs font-black uppercase text-teal-700">{t('averageTransaction')}</p>
          <p className="mt-1 text-lg font-black text-stone-950">
            {formatFinanceAmount(averageTransaction, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-xs font-black uppercase text-amber-700">{t('netMargin')}</p>
          <p className="mt-1 text-lg font-black text-stone-950">
            {netMargin === null
              ? '—'
              : new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: 'percent' }).format(
                  netMargin / 100,
                )}
          </p>
        </div>
      </div>

      <ChartCard
        title={t('cashFlowTrend')}
        description={t('cashFlowTrendBody')}
        emptyLabel={t('noFinancialInsights')}
        data={dailyData}
        currency={currency}
        locale={locale}
        labels={{ income: t('income'), expense: t('expense'), net: t('net') }}
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <ChartCard
          title={t('categoryPerformance')}
          description={t('categoryPerformanceBody')}
          emptyLabel={t('noFinancialInsights')}
          data={categoryData}
          currency={currency}
          locale={locale}
          layout="vertical"
          labels={{ income: t('income'), expense: t('expense'), net: t('net') }}
        />
        <ChartCard
          title={t('branchPerformance')}
          description={t('branchPerformanceBody')}
          emptyLabel={t('noFinancialInsights')}
          data={branchData}
          currency={currency}
          locale={locale}
          layout="vertical"
          labels={{ income: t('income'), expense: t('expense'), net: t('net') }}
        />
      </div>
    </div>
  );
}
