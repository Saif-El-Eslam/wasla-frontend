'use client';

import { Sparkles } from 'lucide-react';
import { BranchSelect, SectionTitle, cx } from '@/components/ui/dashboard-ui';
import type { BranchOption } from '@/lib/api';
import type { Period } from './analytics-utils';

export function AnalyticsHero({
  selectedBranchId,
  onBranchChange,
  branches,
  locale,
  period,
  onPeriodChange,
  fromDate,
  toDate,
  minDate,
  maxDate,
  onDateRangeChange,
  labels,
}: {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  branches: BranchOption[];
  locale: string;
  period: Period;
  onPeriodChange: (period: Exclude<Period, 'custom'>) => void;
  fromDate: string;
  toDate: string;
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (from: string, to: string) => void;
  labels: {
    allBranches: string;
    branchFilter: string;
    analytics: string;
    fromDate: string;
    toDate: string;
  };
}) {
  return (
    <section className="relative z-30 overflow-visible rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-glass backdrop-blur sm:p-5">
      <SectionTitle
        eyebrow={selectedBranchId === 'all' ? labels.allBranches : labels.branchFilter}
        icon={<Sparkles className="size-5 text-teal-700" />}
        title={labels.analytics}
      >
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-end">
          <div className="flex h-12 rounded-3xl border border-white/70 bg-white/80 p-1 shadow-sm">
            {(['7d', '30d'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={cx(
                  'min-w-14 rounded-3xl px-4 text-xs font-black transition',
                  period === item
                    ? 'bg-stone-950 text-white shadow-lg shadow-stone-200'
                    : 'text-stone-500 hover:text-stone-950',
                )}
                onClick={() => onPeriodChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <BranchSelect
            branches={branches}
            value={selectedBranchId}
            onChange={onBranchChange}
            locale={locale}
            includeAll
            allLabel={labels.allBranches}
          />
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:w-[360px]">
            <label className="min-w-0 space-y-1">
              <span className="text-xs font-black text-stone-600">{labels.fromDate}</span>
              <input
                className="h-10 w-full min-w-0 rounded-2xl border border-teal-100 bg-white/95 px-3 text-xs font-black text-stone-800 shadow-sm outline-none focus:border-primary"
                type="date"
                value={fromDate}
                min={minDate}
                max={maxDate}
                onChange={(event) => onDateRangeChange(event.target.value, toDate)}
              />
            </label>
            <label className="min-w-0 space-y-1">
              <span className="text-xs font-black text-stone-600">{labels.toDate}</span>
              <input
                className="h-10 w-full min-w-0 rounded-2xl border border-teal-100 bg-white/95 px-3 text-xs font-black text-stone-800 shadow-sm outline-none focus:border-primary"
                type="date"
                value={toDate}
                min={minDate}
                max={maxDate}
                onChange={(event) => onDateRangeChange(fromDate, event.target.value)}
              />
            </label>
          </div>
        </div>
      </SectionTitle>
    </section>
  );
}
