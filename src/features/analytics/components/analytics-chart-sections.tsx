'use client';

import { ArrowUpRight, QrCode } from 'lucide-react';
import { Card, SectionTitle, cx } from '@/components/ui/dashboard-ui';
import {
  ContactIntentChart,
  DailyViewsLineChart,
  HorizontalAnalyticsChart,
  QrScansColumnChart,
} from './analytics-charts';
import type { AnalyticsChartDatum, Period } from './analytics-utils';
import { changeCopy, changeTone } from './analytics-utils';

export function DailyViewsSection({
  data,
  title,
  eyebrow,
  change,
  period,
  empty,
}: {
  data: AnalyticsChartDatum[];
  title: string;
  eyebrow: string;
  change: number;
  period: Period;
  empty: string;
}) {
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle eyebrow={eyebrow} title={title} />
        <span
          className={cx(
            'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-black',
            changeTone(change),
          )}
        >
          <ArrowUpRight className="me-1 size-3.5" />
          {changeCopy(change, period)}
        </span>
      </div>
      <DailyViewsLineChart data={data} title={title} empty={empty} />
    </Card>
  );
}

export function QrScansSection({
  data,
  title,
  eyebrow,
  change,
  period,
  empty,
}: {
  data: AnalyticsChartDatum[];
  title: string;
  eyebrow: string;
  change: number;
  period: Period;
  empty: string;
}) {
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle eyebrow={eyebrow} title={title} />
        <span
          className={cx(
            'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-black',
            changeTone(change),
          )}
        >
          <QrCode className="me-1 size-3.5" />
          {changeCopy(change, period)}
        </span>
      </div>
      <QrScansColumnChart data={data} title={title} empty={empty} />
    </Card>
  );
}

export function ContactAndBranchSection({
  contactData,
  contactTotal,
  branchData,
  labels,
}: {
  contactData: Array<AnalyticsChartDatum & { tone: string }>;
  contactTotal: number;
  branchData: AnalyticsChartDatum[];
  labels: {
    actions: string;
    contactIntent: string;
    branches: string;
    activitySplit: string;
    noAnalyticsData: string;
    views: string;
  };
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
      <Card className="p-4 sm:p-5">
        <SectionTitle eyebrow={labels.actions} title={labels.contactIntent} />
        <ContactIntentChart
          data={contactData}
          total={contactTotal}
          empty={labels.noAnalyticsData}
          valueName={labels.contactIntent}
        />
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle eyebrow={labels.branches} title={labels.activitySplit} />
        <HorizontalAnalyticsChart
          data={branchData}
          empty={labels.noAnalyticsData}
          valueName={labels.views}
          colors={['#14b8a6', '#f59e0b', '#6366f1', '#f43f5e']}
        />
      </Card>
    </div>
  );
}

export function TopContentSection({
  data,
  labels,
}: {
  data: AnalyticsChartDatum[];
  labels: {
    items: string;
    topContent: string;
    noMenuItemsToRank: string;
    views: string;
  };
}) {
  return (
    <Card className="p-4 sm:p-5">
      <SectionTitle eyebrow={labels.items} title={labels.topContent} />
      <HorizontalAnalyticsChart
        data={data}
        empty={labels.noMenuItemsToRank}
        valueName={labels.views}
        colors={['#f43f5e', '#14b8a6', '#f59e0b', '#6366f1']}
      />
    </Card>
  );
}
