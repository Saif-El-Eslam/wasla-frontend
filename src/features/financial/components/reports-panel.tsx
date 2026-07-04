'use client';

import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SecondaryButton, TabLoader, cx } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { useFinanceAccess, useFinancialAnalytics, useFinancialReport } from '../hooks/use-financial';
import type { FinancialFilters, FinancialReportResponse } from '../types/financial.types';
import {
  downloadReportCsv,
  groupLabel,
  groupSections,
  overviewSections,
  reportSections,
  shareReportCsv,
  type ReportExportGroup,
} from '../utils/financial-export';
import {
  calendarMonthEndDateInput,
  calendarWeekRangeDateInputs,
  dateInputValueInTimeZone,
  endOfDateInputInTimeZone,
  permittedFromDateInTimeZone,
  startOfDateInputInTimeZone,
} from '../utils/financial-date';
import { formatFinanceAmount, summaryTone } from '../utils/financial-format';
import { MetricTile } from './finance-ui';

type ReportGroupBy = 'all' | 'day' | 'week' | 'month' | 'branch' | 'category' | 'paymentMethod';

type ReportData = FinancialReportResponse['report'];

const pageSize = 8;

function parseDayKey(key: string, timeZone?: string) {
  return { from: startOfDateInputInTimeZone(key, timeZone), to: endOfDateInputInTimeZone(key, timeZone) };
}

function parseMonthKey(key: string, timeZone?: string) {
  const [year, month] = key.split('-').map(Number);
  const from = `${year}-${String(month || 1).padStart(2, '0')}-01`;
  const to = calendarMonthEndDateInput(key);

  return { from: startOfDateInputInTimeZone(from, timeZone), to: endOfDateInputInTimeZone(to, timeZone) };
}

function parseWeekKey(key: string, timeZone?: string) {
  const range = calendarWeekRangeDateInputs(key);

  return {
    from: startOfDateInputInTimeZone(range.from, timeZone),
    to: endOfDateInputInTimeZone(range.to, timeZone),
  };
}

export function ReportsPanel({ locale, currency }: { locale: string; currency: string }) {
  const t = useTranslations('dashboard');
  const access = useFinanceAccess();
  const timeZone = access.data?.timeZone;
  const historyMonths = access.data?.allowance.historyMonths ?? 3;
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('all');
  const [fromDate, setFromDate] = useState(() => permittedFromDateInTimeZone(3, timeZone));
  const [toDate, setToDate] = useState(() => dateInputValueInTimeZone(new Date(), timeZone));
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selectedGroup, setSelectedGroup] = useState<ReportExportGroup | null>(null);
  const [rangeTouched, setRangeTouched] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const effectiveFromDate = rangeTouched ? fromDate : permittedFromDateInTimeZone(historyMonths, timeZone);
  const effectiveToDate = rangeTouched ? toDate : dateInputValueInTimeZone(new Date(), timeZone);
  const baseFilters = useMemo<FinancialFilters>(
    () => ({
      from: startOfDateInputInTimeZone(effectiveFromDate, timeZone),
      to: endOfDateInputInTimeZone(effectiveToDate, timeZone),
    }),
    [effectiveFromDate, effectiveToDate, timeZone],
  );
  const analyticsGroupBy = groupBy === 'all' ? 'day' : groupBy;
  const reportsReady = Boolean(access.data);
  const analytics = useFinancialAnalytics({ ...baseFilters, groupBy: analyticsGroupBy }, reportsReady && groupBy !== 'all');
  const overviewReport = useFinancialReport(baseFilters, reportsReady);
  const groups = useMemo<ReportExportGroup[]>(() => {
    if (groupBy === 'all') {
      const summary = overviewReport.data?.report.summary;

      return summary
        ? [{
            key: 'all',
            label: t('allPermittedPeriod'),
            income: summary.income,
            expenses: summary.expenses,
            net: summary.net,
            count: summary.count,
          }]
        : [];
    }

    return analytics.data?.analytics.groups ?? [];
  }, [analytics.data?.analytics.groups, groupBy, overviewReport.data?.report.summary, t]);
  const visibleGroups = groups.slice(0, visibleCount);
  const detailFilters = useMemo(
    () => groupFilters(groupBy, selectedGroup, baseFilters, timeZone),
    [baseFilters, groupBy, selectedGroup, timeZone],
  );
  const detailReport = useFinancialReport(detailFilters ?? {}, reportsReady && Boolean(detailFilters));

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && visibleCount < groups.length) {
          setVisibleCount((count) => Math.min(count + pageSize, groups.length));
        }
      },
      { rootMargin: '180px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [groups.length, visibleCount]);

  const downloadOverviewCsv = () => {
    downloadReportCsv(
      'financial-report-overview.csv',
      t('reportsOverview'),
      overviewSections(groups, locale, currency),
    );
  };

  const shareOverviewCsv = () =>
    shareReportCsv(
      'financial-report-overview.csv',
      t('reportsOverview'),
      overviewSections(groups, locale, currency),
    );

  if (access.isLoading || overviewReport.isLoading || (groupBy !== 'all' && analytics.isLoading)) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (selectedGroup) {
    return (
      <ReportDetails
        currency={currency}
        group={selectedGroup}
        label={groupLabel(selectedGroup, locale)}
        locale={locale}
        report={detailReport.data?.report}
        loading={detailReport.isLoading}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'day', 'week', 'month', 'branch', 'category', 'paymentMethod'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={cx(
                'h-9 rounded-xl border px-3 text-xs font-black',
                groupBy === item ? 'border-primary bg-teal-50 text-primary' : 'border-stone-200 bg-white text-stone-600',
              )}
              onClick={() => {
                setGroupBy(item);
                setVisibleCount(pageSize);
                setSelectedGroup(null);
                if (item === 'all') {
                  setRangeTouched(false);
                }
              }}
            >
              {item === 'all' ? t('all') : t(`financeGroup_${item}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={downloadOverviewCsv}>
            <Download className="size-4" />
            CSV
          </SecondaryButton>
          <SecondaryButton onClick={shareOverviewCsv}>
            <Share2 className="size-4" />
            {t('share')}
          </SecondaryButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('fromDate')}</span>
          <input
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            type="date"
            value={effectiveFromDate}
            onChange={(event) => {
              setRangeTouched(true);
              setFromDate(event.target.value);
              setVisibleCount(pageSize);
              setSelectedGroup(null);
            }}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('toDate')}</span>
          <input
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            type="date"
            value={effectiveToDate}
            onChange={(event) => {
              setRangeTouched(true);
              setToDate(event.target.value);
              setVisibleCount(pageSize);
              setSelectedGroup(null);
            }}
          />
        </label>
      </div>

      {overviewReport.data?.report.summary ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MetricTile title={t('income')} value={formatFinanceAmount(overviewReport.data.report.summary.income, currency)} tone="text-emerald-700" />
          <MetricTile title={t('expense')} value={formatFinanceAmount(overviewReport.data.report.summary.expenses, currency)} tone="text-red-700" />
          <MetricTile title={t('net')} value={formatFinanceAmount(overviewReport.data.report.summary.net, currency)} tone={summaryTone(overviewReport.data.report.summary)} />
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {visibleGroups.map((group) => (
          <div
            key={group.key}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <button type="button" className="min-w-0 flex-1 text-start" onClick={() => setSelectedGroup(group)}>
                <p className="font-black text-stone-950">{groupLabel(group, locale)}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{group.count} {t('transactions')}</p>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500"
                  onClick={() =>
                    downloadReportCsv(
                      `financial-report-${group.key}.csv`,
                      groupLabel(group, locale),
                      groupSections(group, currency),
                    )
                  }
                >
                  <Download className="size-4" />
                </button>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500"
                  onClick={() =>
                    shareReportCsv(
                      `financial-report-${group.key}.csv`,
                      groupLabel(group, locale),
                      groupSections(group, currency),
                    )
                  }
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>
            <button type="button" className="mt-4 grid w-full grid-cols-3 gap-2 text-start text-xs font-black" onClick={() => setSelectedGroup(group)}>
              <span className="rounded-xl bg-emerald-50 px-2 py-2 text-emerald-700">{formatFinanceAmount(group.income, currency)}</span>
              <span className="rounded-xl bg-red-50 px-2 py-2 text-red-700">{formatFinanceAmount(group.expenses, currency)}</span>
              <span className={cx('rounded-xl bg-stone-50 px-2 py-2', group.net >= 0 ? 'text-emerald-700' : 'text-red-700')}>{formatFinanceAmount(group.net, currency)}</span>
            </button>
          </div>
        ))}
      </div>

      {!groups.length ? (
        <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">{t('noReportResults')}</p>
      ) : null}
      <div ref={loadMoreRef} className="h-6" />
    </div>
  );
}

function groupFilters(
  groupBy: ReportGroupBy,
  group: ReportExportGroup | null,
  baseFilters: FinancialFilters,
  timeZone?: string,
): FinancialFilters | null {
  if (!group) {
    return null;
  }

  if (groupBy === 'all') {
    return baseFilters;
  }

  if (groupBy === 'day') {
    return { ...baseFilters, ...parseDayKey(group.key, timeZone) };
  }

  if (groupBy === 'month') {
    return { ...baseFilters, ...parseMonthKey(group.key, timeZone) };
  }

  if (groupBy === 'week') {
    return { ...baseFilters, ...parseWeekKey(group.key, timeZone) };
  }

  if (groupBy === 'branch') {
    return { ...baseFilters, branchId: group.key };
  }

  if (groupBy === 'category') {
    return { ...baseFilters, categoryId: group.key };
  }

  if (groupBy === 'paymentMethod') {
    return group.key === 'none' ? baseFilters : { ...baseFilters, paymentMethodId: group.key };
  }

  return baseFilters;
}

function ReportDetails({
  currency,
  group,
  label,
  locale,
  loading,
  onBack,
  report,
}: {
  currency: string;
  group: ReportExportGroup;
  label: string;
  locale: string;
  loading: boolean;
  onBack: () => void;
  report?: ReportData;
}) {
  const t = useTranslations('dashboard');
  const detailSections = useMemo(
    () => (report ? reportSections(report, locale, currency) : []),
    [currency, locale, report],
  );

  if (loading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SecondaryButton onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t('back')}
        </SecondaryButton>
        <div className="flex gap-2">
          <SecondaryButton
            onClick={() =>
              downloadReportCsv(
                `financial-report-${group.key}-details.csv`,
                label,
                detailSections,
              )
            }
          >
            <Download className="size-4" />
            CSV
          </SecondaryButton>
          <SecondaryButton
            onClick={() =>
              shareReportCsv(
                `financial-report-${group.key}-details.csv`,
                label,
                detailSections,
              )
            }
          >
            <Share2 className="size-4" />
            {t('share')}
          </SecondaryButton>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-normal text-muted-foreground">{t('reportDetails')}</p>
        <h3 className="mt-1 text-lg font-black text-stone-950">{label}</h3>
      </section>

      {report ? (
        <>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <MetricTile title={t('income')} value={formatFinanceAmount(report.summary.income, currency)} tone="text-emerald-700" />
            <MetricTile title={t('expense')} value={formatFinanceAmount(report.summary.expenses, currency)} tone="text-red-700" />
            <MetricTile title={t('net')} value={formatFinanceAmount(report.summary.net, currency)} tone={summaryTone(report.summary)} />
          </div>
          <DetailSection title={t('categoryReport')}>
            {report.byCategory.map((item) => (
              <DetailRow
                key={item.categoryId}
                label={textForLocale(item.name, locale)}
                meta={`${item.count} ${t('transactions')}`}
                tone={item.type === 'IN' ? 'income' : 'expense'}
                value={formatFinanceAmount(item.amount, currency)}
              />
            ))}
          </DetailSection>
          <DetailSection title={t('branchReport')}>
            {report.byBranch.map((item) => (
              <DetailRow
                key={item.branchId}
                label={textForLocale(item.name, locale)}
                meta={`${t('income')}: ${formatFinanceAmount(item.income, currency)} - ${t('expense')}: ${formatFinanceAmount(item.expenses, currency)}`}
                tone={item.net >= 0 ? 'income' : 'expense'}
                value={formatFinanceAmount(item.net, currency)}
              />
            ))}
          </DetailSection>
          <DetailSection title={t('paymentMethodReport')}>
            {report.byPaymentMethod.map((item) => (
              <DetailRow
                key={item.paymentMethodId ?? 'none'}
                label={textForLocale(item.name, locale)}
                meta={`${t('income')}: ${formatFinanceAmount(item.income, currency)} - ${t('expense')}: ${formatFinanceAmount(item.expenses, currency)}`}
                tone={item.net >= 0 ? 'income' : 'expense'}
                value={formatFinanceAmount(item.net, currency)}
              />
            ))}
          </DetailSection>
        </>
      ) : null}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="font-black text-stone-950">{title}</h3>
      <div className="mt-3 divide-y divide-stone-100">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  meta,
  tone,
  value,
}: {
  label: string;
  meta: string;
  tone: 'income' | 'expense';
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div>
        <p className="font-black text-stone-900">{label}</p>
        <p className="text-xs font-bold text-muted-foreground">{meta}</p>
      </div>
      <p className={cx('font-black', tone === 'income' ? 'text-emerald-700' : 'text-red-700')}>{value}</p>
    </div>
  );
}
