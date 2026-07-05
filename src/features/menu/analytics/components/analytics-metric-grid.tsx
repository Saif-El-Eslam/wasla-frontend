'use client';

import { Eye, MessageCircle, QrCode, TrendingDown, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { Card, cx } from '@/components/ui/dashboard-ui';
import type { Period } from './analytics-utils';
import { changeCopy, changeTone } from './analytics-utils';

function StatPill({
  icon: Icon,
  label,
  value,
  change,
  period,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  change: number;
  period: Period;
  tone: string;
}) {
  const TrendIcon = change < 0 ? TrendingDown : TrendingUp;

  return (
    <Card className="min-w-0 overflow-hidden p-1 md:p-3">
      <div className={cx('relative min-h-32 rounded-3xl p-2 md:p-4', tone)}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-2xl bg-white/70 p-2 shadow-sm">
            <Icon className="size-4" />
          </span>
          <span className={cx('rounded-full border px-2 py-1 text-[10px] font-black', changeTone(change))}>
            <TrendIcon className="me-1 inline size-3" />
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        </div>
        <p className="mt-5 truncate text-3xl font-black">{value.toLocaleString()}</p>
        <p className="truncate text-xs font-black opacity-80">{label}</p>
        <p className="hidden md:block mt-3 text-[10px] font-bold opacity-70">{changeCopy(change, period)}</p>
      </div>
    </Card>
  );
}

export function AnalyticsMetricGrid({
  labels,
  values,
  changes,
  period,
}: {
  labels: {
    views: string;
    qrScans: string;
    items: string;
    contactIntent: string;
  };
  values: {
    views: number;
    scans: number;
    itemViews: number;
    contactTotal: number;
  };
  changes: {
    views: number;
    scans: number;
    itemViews: number;
    contact: number;
  };
  period: Period;
}) {
  return (
    <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
      <StatPill
        icon={Eye}
        label={labels.views}
        value={values.views}
        change={changes.views}
        period={period}
        tone="bg-teal-50 text-teal-800"
      />
      <StatPill
        icon={QrCode}
        label={labels.qrScans}
        value={values.scans}
        change={changes.scans}
        period={period}
        tone="bg-amber-50 text-amber-800"
      />
      <StatPill
        icon={UtensilsCrossed}
        label={labels.items}
        value={values.itemViews}
        change={changes.itemViews}
        period={period}
        tone="bg-rose-50 text-rose-800"
      />
      <StatPill
        icon={MessageCircle}
        label={labels.contactIntent}
        value={values.contactTotal}
        change={changes.contact}
        period={period}
        tone="bg-indigo-50 text-indigo-800"
      />
    </div>
  );
}
