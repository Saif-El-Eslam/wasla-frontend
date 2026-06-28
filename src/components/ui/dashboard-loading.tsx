import { BarChart3, GitBranch, QrCode, UtensilsCrossed } from 'lucide-react';

function DashboardSkeletonCard({ index }: { index: number }) {
  const icons = [BarChart3, UtensilsCrossed, GitBranch, QrCode];
  const Icon = icons[index % icons.length];

  return (
    <div className={`wasla-dashboard-card-loader wasla-dashboard-card-loader-${index + 1} rounded-2xl border border-border bg-white p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50">
          <Icon className="size-5 text-teal-700" />
        </div>
        <div className="wasla-dashboard-skeleton h-7 w-16 rounded-full" />
      </div>
      <div className="wasla-dashboard-skeleton mt-5 h-4 w-3/4 rounded-full" />
      <div className="wasla-dashboard-skeleton mt-3 h-3 w-1/2 rounded-full" />
    </div>
  );
}

export function DashboardLoading({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <main className="w-full">
        <section className="wasla-dashboard-card-loader rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                <BarChart3 className="size-5 text-teal-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="wasla-dashboard-skeleton h-5 w-48 max-w-full rounded-full" />
                <div className="wasla-dashboard-skeleton mt-3 h-3 w-72 max-w-full rounded-full" />
              </div>
            </div>
            <div className="wasla-dashboard-skeleton h-10 w-28 rounded-xl" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="wasla-dashboard-skeleton size-10 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="wasla-dashboard-skeleton h-3 w-3/4 rounded-full" />
                    <div className="wasla-dashboard-skeleton mt-2 h-2.5 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex min-h-52 items-end gap-2 rounded-2xl bg-teal-50/50 p-4">
              {[48, 70, 44, 86, 62, 94, 58, 76].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="wasla-dashboard-chart-bar w-full rounded-t-xl bg-teal-200"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f8fafa]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-600 text-lg font-black text-white shadow-lg shadow-teal-900/10">
              W
            </div>
            <div>
              <div className="wasla-dashboard-skeleton h-4 w-28 rounded-full" />
              <div className="wasla-dashboard-skeleton mt-2 h-3 w-40 rounded-full" />
            </div>
          </div>
          <div className="wasla-dashboard-skeleton h-10 w-24 rounded-xl" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-2xl border border-border bg-white p-3 shadow-sm lg:block">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="mb-2 flex items-center gap-3 rounded-xl p-2">
                <div className="wasla-dashboard-skeleton size-9 rounded-xl" />
                <div className="wasla-dashboard-skeleton h-3 w-28 rounded-full" />
              </div>
            ))}
          </aside>

          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="wasla-dashboard-skeleton h-5 w-44 rounded-full" />
                  <div className="wasla-dashboard-skeleton mt-3 h-3 w-64 max-w-full rounded-full" />
                </div>
                <div className="wasla-dashboard-skeleton h-11 w-32 rounded-xl" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <DashboardSkeletonCard key={index} index={index} />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="wasla-dashboard-skeleton h-5 w-40 rounded-full" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="wasla-dashboard-skeleton size-10 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <div className="wasla-dashboard-skeleton h-3 w-3/4 rounded-full" />
                        <div className="wasla-dashboard-skeleton mt-2 h-2.5 w-1/2 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="wasla-dashboard-skeleton h-5 w-36 rounded-full" />
                <div className="mt-5 flex h-44 items-end gap-2">
                  {[35, 58, 42, 76, 62, 88, 54].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end">
                      <div className="wasla-dashboard-chart-bar w-full rounded-t-xl bg-teal-100" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
