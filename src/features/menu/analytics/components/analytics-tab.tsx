'use client';

import { useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState, TabLoader } from '@/components/ui/dashboard-ui';
import { useAnalyticsSummary, useBranchOptions } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';
import { AnalyticsHero } from './analytics-hero';
import { AnalyticsMetricGrid } from './analytics-metric-grid';
import {
  ContactAndBranchSection,
  DailyViewsSection,
  QrScansSection,
  TopContentSection,
} from './analytics-chart-sections';
import type { AnalyticsChartDatum, Period } from './analytics-utils';
import { branchLabel, metricChange, metricCurrent } from './analytics-utils';

export function AnalyticsTab({
  selectedBranchId,
  onBranchChange,
  locale,
}: {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const [period, setPeriod] = useState<Period>('7d');
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const analytics = useAnalyticsSummary({
    period,
    branchId: selectedBranchId === 'all' ? undefined : selectedBranchId,
  });
  const summary = analytics.data;
  const metrics = summary?.metrics;
  const series = summary?.series ?? [];

  const viewTotal = metricCurrent(metrics, 'views');
  const scanTotal = metricCurrent(metrics, 'scans');
  const itemViewTotal = metricCurrent(metrics, 'itemViews');
  const contactTotal =
    metricCurrent(metrics, 'whatsapp') + metricCurrent(metrics, 'calls') + metricCurrent(metrics, 'maps');

  const dailyViews = useMemo<AnalyticsChartDatum[]>(
    () =>
      series.map((item) => ({
        label: item.label,
        value: item.views,
        views: item.views,
        scans: item.scans,
        percentage: item.views > 0 ? (item.scans / item.views) * 100 : 0,
        percentageLabel: `${t('qrScans')} / ${t('views')}`,
      })),
    [series, t],
  );

  const dailyScans = useMemo<AnalyticsChartDatum[]>(
    () =>
      series.map((item) => ({
        label: item.label,
        value: item.scans,
        views: item.views,
        scans: item.scans,
        percentage: item.views > 0 ? (item.scans / item.views) * 100 : 0,
        percentageLabel: `${t('qrScans')} / ${t('views')}`,
      })),
    [series, t],
  );

  const branchBars = useMemo<AnalyticsChartDatum[]>(
    () =>
      (summary?.branchActivity ?? []).map((branch) => ({
        label: branchLabel(branch.name, branch.slug, locale),
        value: branch.value,
        slug: branch.slug,
      })),
    [locale, summary?.branchActivity],
  );

  const topItems = useMemo<AnalyticsChartDatum[]>(
    () =>
      (summary?.topItems ?? []).map((item, index) => ({
        label: textForLocale(item.name, locale) || `${t('item')} ${index + 1}`,
        value: item.views,
        rank: index + 1,
      })),
    [locale, summary?.topItems, t],
  );

  const contactData = useMemo(
    () => [
      {
        label: t('whatsappMetric'),
        value: metricCurrent(metrics, 'whatsapp'),
        percentage: contactTotal ? (metricCurrent(metrics, 'whatsapp') / contactTotal) * 100 : 0,
        percentageLabel: t('contactIntent'),
        tone: '#10b981',
      },
      {
        label: t('calls'),
        value: metricCurrent(metrics, 'calls'),
        percentage: contactTotal ? (metricCurrent(metrics, 'calls') / contactTotal) * 100 : 0,
        percentageLabel: t('contactIntent'),
        tone: '#1c1917',
      },
      {
        label: t('maps'),
        value: metricCurrent(metrics, 'maps'),
        percentage: contactTotal ? (metricCurrent(metrics, 'maps') / contactTotal) * 100 : 0,
        percentageLabel: t('contactIntent'),
        tone: '#6366f1',
      },
    ],
    [contactTotal, metrics, t],
  );

  if (branchOptions.isLoading || analytics.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (branches.length === 0) {
    return <EmptyState icon={Building2} title={t('createBranchFirst')} body={t('menuNeedsBranch')} />;
  }

  return (
    <div className="space-y-5">
      <AnalyticsHero
        selectedBranchId={selectedBranchId}
        onBranchChange={onBranchChange}
        branches={branches}
        locale={locale}
        period={period}
        onPeriodChange={setPeriod}
        labels={{
          allBranches: t('allBranches'),
          branchFilter: t('branchFilter'),
          analytics: t('analytics'),
        }}
      />

      <AnalyticsMetricGrid
        labels={{
          views: t('views'),
          qrScans: t('qrScans'),
          items: t('items'),
          contactIntent: t('contactIntent'),
        }}
        values={{
          views: viewTotal,
          scans: scanTotal,
          itemViews: itemViewTotal,
          contactTotal,
        }}
        changes={{
          views: metricChange(metrics, 'views'),
          scans: metricChange(metrics, 'scans'),
          itemViews: metricChange(metrics, 'itemViews'),
          contact: Math.max(
            metricChange(metrics, 'whatsapp'),
            metricChange(metrics, 'calls'),
            metricChange(metrics, 'maps'),
          ),
        }}
        period={period}
      />

      <div className="grid gap-4 2xl:grid-cols-[1fr_0.95fr]">
        <DailyViewsSection
          data={dailyViews}
          title={t('dailyViews')}
          eyebrow={t('engagement')}
          change={metricChange(metrics, 'views')}
          period={period}
          empty={t('noAnalyticsData')}
        />

        <QrScansSection
          data={dailyScans}
          title={t('dailyScans')}
          eyebrow={t('qr')}
          change={metricChange(metrics, 'scans')}
          period={period}
          empty={t('noAnalyticsData')}
        />
      </div>
      <ContactAndBranchSection
        contactData={contactData}
        contactTotal={contactTotal}
        branchData={branchBars}
        labels={{
          actions: t('actions'),
          contactIntent: t('contactIntent'),
          branches: t('branches'),
          activitySplit: t('activitySplit'),
          noAnalyticsData: t('noAnalyticsData'),
          views: t('views'),
        }}
      />

      <TopContentSection
        data={topItems}
        labels={{
          items: t('items'),
          topContent: t('topContent'),
          noMenuItemsToRank: t('noMenuItemsToRank'),
          views: t('views'),
        }}
      />
    </div>
  );
}
