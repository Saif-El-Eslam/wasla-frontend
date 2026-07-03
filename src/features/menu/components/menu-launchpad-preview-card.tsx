'use client';

import { Bell, Sparkles } from 'lucide-react';
import { cx } from '@/components/ui/dashboard-ui';

export function MenuLaunchpadPreviewCard({
  title,
  description,
  metric,
  notifyLabel,
}: {
  title: string;
  description: string;
  metric: string;
  notifyLabel: string;
}) {
  return (
    <div className="min-h-[150px] rounded-2xl border border-dashed border-stone-300 bg-stone-50/90 p-3 text-start grayscale-[0.35] lg:min-h-[252px] lg:p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-lg lg:size-12 lg:rounded-2xl">
          <Sparkles className="size-5 lg:size-6" />
        </span>
        <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-normal text-stone-500">
          {metric}
        </span>
      </div>
      <h3 className="mt-3 text-base font-black text-stone-950 lg:mt-5 lg:text-lg">{title}</h3>
      <p className="mt-1.5 text-sm leading-5 text-muted-foreground lg:mt-2 lg:min-h-12 lg:leading-6">
        {description}
      </p>
      <div className="mt-0 grid grid-cols-3 gap-2 hidden lg:block lg:mt-1">
        {[34, 52, 28].map((height, index) => (
          <span key={height} className="flex h-10 items-end rounded-xl bg-white p-1.5 lg:h-16 lg:p-2">
            <span
              className={cx(
                'w-full rounded-lg',
                index === 0 ? 'bg-stone-300' : index === 1 ? 'bg-teal-200' : 'bg-amber-200',
              )}
              style={{ height }}
            />
          </span>
        ))}
      </div>
      <button
        type="button"
        className="hidden mt-3 h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-100 lg:mt-4 lg:h-10"
      >
        <Bell className="size-4" />
        {notifyLabel}
      </button>
    </div>
  );
}
