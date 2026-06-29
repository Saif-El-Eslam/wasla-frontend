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
  labels,
}: {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  branches: BranchOption[];
  locale: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  labels: {
    allBranches: string;
    branchFilter: string;
    analytics: string;
  };
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-glass backdrop-blur sm:p-5">
      <SectionTitle
        eyebrow={selectedBranchId === 'all' ? labels.allBranches : labels.branchFilter}
        icon={<Sparkles className="size-5 text-teal-700" />}
        title={labels.analytics}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>
      </SectionTitle>
    </section>
  );
}
