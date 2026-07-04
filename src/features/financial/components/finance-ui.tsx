'use client';

import { ArrowUpRight } from 'lucide-react';
import { cx } from '@/components/ui/dashboard-ui';

export type FinancePanel = 'add' | 'transactions' | 'reports' | 'categories' | 'paymentMethods';

export type FinanceLaunchpadCard = {
  id: FinancePanel;
  title: string;
  description: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  adminOnly?: boolean;
};

export function FinanceCard({ card, onClick }: { card: FinanceLaunchpadCard; onClick: () => void }) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-[128px] sm:min-h-[146px] rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/60 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <span
          className={cx(
            'flex size-10 sm:size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
            card.accent,
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </span>

        <span className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition group-hover:border-teal-200 group-hover:text-teal-700">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-black text-stone-950 line-clamp-2">
        {card.title}
      </h3>

      <p className="mt-1 text-xs sm:text-sm leading-5 text-muted-foreground line-clamp-2 sm:line-clamp-3">
        {card.description}
      </p>

      <div className="mt-3 hidden sm:inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">
        {card.metric}
      </div>
    </button>
  );
}

export function MetricTile({
  title,
  value,
  tone = 'text-stone-950',
}: {
  title: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-normal text-muted-foreground">{title}</p>
      <p className={cx('mt-2 text-lg sm:text-xl font-black', tone)}>{value}</p>
    </div>
  );
}
