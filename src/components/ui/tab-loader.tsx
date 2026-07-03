'use client';

export function TabLoader({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
        <span className="wasla-dashboard-dot size-2 rounded-full bg-teal-600" />
        {label}
      </div>
      <div className="mt-4 space-y-3">
        <div className="wasla-dashboard-skeleton h-4 w-2/3 max-w-full rounded-full" />
        <div className="wasla-dashboard-skeleton h-3 w-full rounded-full" />
        <div className="wasla-dashboard-skeleton h-3 w-5/6 rounded-full" />
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <div className="wasla-dashboard-skeleton h-24 rounded-2xl" />
          <div className="wasla-dashboard-skeleton h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
