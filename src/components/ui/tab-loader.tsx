'use client';

import { DashboardLoading } from './dashboard-loading';

export function TabLoader({ label }: { label: string }) {
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
        <span className="wasla-dashboard-dot size-2 rounded-full bg-teal-600" />
        {label}
      </div>
      <DashboardLoading compact />
    </div>
  );
}
