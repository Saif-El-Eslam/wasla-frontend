'use client';

import { useTranslations } from 'next-intl';
import { TabLoader } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { useFinancialReport } from '../hooks/use-financial';
import { formatFinanceAmount, summaryTone } from '../utils/financial-format';
import { MetricTile } from './finance-ui';

export function ReportsPanel({
  locale,
  currency,
}: {
  locale: string;
  currency: string;
}) {
  const t = useTranslations('dashboard');
  const report = useFinancialReport();
  const data = report.data?.report;

  if (report.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (!data) {
    return <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">{t('noReportResults')}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile title={t('income')} value={formatFinanceAmount(data.summary.income, currency)} tone="text-emerald-700" />
        <MetricTile title={t('expense')} value={formatFinanceAmount(data.summary.expenses, currency)} tone="text-red-700" />
        <MetricTile title={t('net')} value={formatFinanceAmount(data.summary.net, currency)} tone={summaryTone(data.summary)} />
      </div>

      <ReportSection title={t('categoryReport')}>
        {data.byCategory.map((item) => (
          <ReportRow key={item.categoryId} label={textForLocale(item.name, locale)} value={formatFinanceAmount(item.amount, currency)} meta={`${item.count} ${t('transactions')}`} />
        ))}
      </ReportSection>

      <ReportSection title={t('branchReport')}>
        {data.byBranch.map((item) => (
          <ReportRow key={item.branchId} label={textForLocale(item.name, locale)} value={formatFinanceAmount(item.net, currency)} meta={`${t('income')} ${formatFinanceAmount(item.income, currency)} - ${t('expense')} ${formatFinanceAmount(item.expenses, currency)}`} />
        ))}
      </ReportSection>

      <ReportSection title={t('paymentMethodReport')}>
        {data.byPaymentMethod.map((item) => (
          <ReportRow key={item.paymentMethodId ?? 'none'} label={textForLocale(item.name, locale)} value={formatFinanceAmount(item.net, currency)} meta={`${item.count} ${t('transactions')}`} />
        ))}
      </ReportSection>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="font-black text-stone-950">{title}</h3>
      <div className="mt-3 divide-y divide-stone-100">{children}</div>
    </section>
  );
}

function ReportRow({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div>
        <p className="font-black text-stone-900">{label}</p>
        <p className="text-xs font-bold text-muted-foreground">{meta}</p>
      </div>
      <p className="font-black text-stone-950">{value}</p>
    </div>
  );
}
