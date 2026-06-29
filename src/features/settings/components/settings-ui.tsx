'use client';

import type { ElementType, ReactNode } from 'react';

export const settingsInputClassName =
  'h-12 w-full rounded-2xl border border-teal-100 bg-white/95 px-4 text-sm font-bold text-stone-950 shadow-sm shadow-teal-50 outline-none transition placeholder:text-stone-400 focus:border-primary focus:ring-4 focus:ring-teal-100';

export function SettingsPanelHeader({
  icon: Icon,
  title,
  body,
}: {
  icon: ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary ring-1 ring-teal-100">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-black leading-6 text-stone-950">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm shadow-teal-50">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal text-teal-700">
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-black text-stone-950">{value}</p>
    </div>
  );
}
