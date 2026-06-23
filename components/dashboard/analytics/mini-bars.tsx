'use client';

import { cx } from '@/components/dashboard/dashboard-ui';

export function MiniBars({
  data,
  tone = 'bg-primary',
}: {
  data: Array<{ label: string; value: number }>;
  tone?: string;
}) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="mt-4 flex h-32 items-end gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end rounded-t-xl bg-stone-50">
            <div className={cx('w-full rounded-t-xl transition-all', tone)} style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
