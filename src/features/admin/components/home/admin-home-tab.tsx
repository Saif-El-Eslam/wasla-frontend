'use client';

import { ArrowRight, BarChart3, Building2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/dashboard-ui';
import type { AdminSubscriptionOverview } from '@/lib/api/types';
import type { AdminSubscriptionTab } from '../admin-subscription-tabs';
import { AdminMetricsGrid, ExpiringSoonPanel } from './admin-subscription-overview';

const quickActions = [
  {
    tab: 'venues' as const,
    icon: Building2,
    titleKey: 'home.actions.venuesTitle',
    bodyKey: 'home.actions.venuesBody',
  },
  {
    tab: 'matrix' as const,
    icon: BarChart3,
    titleKey: 'home.actions.matrixTitle',
    bodyKey: 'home.actions.matrixBody',
  },
  {
    tab: 'plans' as const,
    icon: Package,
    titleKey: 'home.actions.plansTitle',
    bodyKey: 'home.actions.plansBody',
  },
];

export function AdminHomeTab({
  overview,
  locale,
  onTabChange,
}: {
  overview: AdminSubscriptionOverview | undefined;
  locale: string;
  onTabChange: (tab: AdminSubscriptionTab) => void;
}) {
  const t = useTranslations('admin');

  return (
    <div className="space-y-5">
      <AdminMetricsGrid metrics={overview?.metrics} locale={locale} />

      <div className="grid gap-3 xl:grid-cols-[3fr_minmax(320px,2fr)]">
        <ExpiringSoonPanel expiringSoon={overview?.expiringSoon ?? []} locale={locale} />

        <Card className="border-teal-100 bg-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
              {t('home.quickActionsEyebrow')}
            </p>
            <h2 className="mt-2 text-lg font-black text-stone-950">{t('home.quickActionsTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('home.quickActionsBody')}</p>
          </div>

          <div className="mt-4 grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.tab}
                  type="button"
                  className="group flex min-h-20 items-center gap-3 rounded-2xl border border-teal-100 bg-[#f8fafa] p-3 text-start transition hover:border-primary hover:bg-teal-50"
                  onClick={() => onTabChange(action.tab)}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-glass">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-stone-950">{t(action.titleKey)}</span>
                    <span className="mt-0.5 block text-xs font-bold leading-5 text-stone-500">
                      {t(action.bodyKey)}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-stone-300 transition group-hover:text-primary rtl:rotate-180" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
