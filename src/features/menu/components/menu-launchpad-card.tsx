'use client';

import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { cx } from '@/components/ui/dashboard-ui';
import type { LaunchpadCard } from './menu-launchpad-types';

export function MenuLaunchpadCard({
  card,
  onClick,
  openLabel,
}: {
  card: LaunchpadCard;
  onClick: () => void;
  openLabel: string;
}) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-[150px] rounded-2xl border border-stone-200 bg-white p-3 text-start shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/70 focus-visible:outline-primary lg:min-h-[252px] lg:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cx(
            'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg lg:size-12 lg:rounded-2xl',
            card.accent,
          )}
        >
          <Icon className="size-5 lg:size-6" />
        </span>
        <span className="flex size-8 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition group-hover:border-teal-200 group-hover:text-teal-700 lg:size-9">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="mt-3 lg:mt-5">
        <h3 className="text-base font-black text-stone-950 lg:text-lg">{card.title}</h3>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground lg:mt-2 lg:min-h-12 lg:leading-6">
          {card.description}
        </p>
      </div>

      <div className="mt-0 lg:mt-1 hidden lg:block">
        <div className={cx('inline-flex rounded-full px-3 py-1 text-xs font-black', card.metricTone)}>
          {card.metric}
        </div>
        <CardMicroVisual type={card.visual} />
      </div>

      <span className="mt-3 items-center gap-1 text-xs font-black text-teal-700 hidden lg:inline-flex lg:mt-4">
        {openLabel}
        <ChevronRight className="size-3.5" />
      </span>
    </button>
  );
}

function CardMicroVisual({ type }: { type: LaunchpadCard['visual'] }) {
  if (type === 'qr') {
    return (
      <div className="mt-3 grid size-12 grid-cols-3 gap-1 rounded-xl bg-stone-950 p-1.5 lg:mt-4 lg:size-16 lg:p-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={cx('rounded-[3px] bg-white', [1, 5, 7].includes(index) ? 'opacity-40' : 'opacity-100')}
          />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="mt-3 flex h-12 items-end gap-1.5 rounded-xl bg-stone-50 p-2 lg:mt-4 lg:h-16 lg:gap-2 lg:p-3">
        {[30, 44, 26, 54, 38].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className={cx(
              'w-full rounded-full',
              index === 3 ? 'bg-indigo-500' : index === 1 ? 'bg-teal-400' : 'bg-stone-300',
            )}
            style={{ height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-1.5 rounded-xl bg-stone-50 p-2.5 lg:mt-4 lg:space-y-2 lg:p-3">
      <span className="block h-2 rounded-full bg-teal-500" />
      <span className="block h-2 w-2/3 rounded-full bg-amber-300" />
      <span className="block h-2 w-4/5 rounded-full bg-stone-300" />
    </div>
  );
}
