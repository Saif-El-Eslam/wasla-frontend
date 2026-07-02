'use client';

import { BarChart3, Building2, KeyRound, LayoutDashboard, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cx } from '@/components/ui/dashboard-ui';

export type AdminSubscriptionTab = 'home' | 'venues' | 'verification' | 'matrix' | 'plans';

export function AdminSubscriptionTabs({
  activeTab,
  onChange,
}: {
  activeTab: AdminSubscriptionTab;
  onChange: (tab: AdminSubscriptionTab) => void;
}) {
  const t = useTranslations('admin');
  const tabs = [
    { id: 'home' as const, label: t('tabs.home'), icon: LayoutDashboard },
    { id: 'venues' as const, label: t('tabs.venues'), icon: Building2 },
    { id: 'verification' as const, label: t('tabs.verification'), icon: KeyRound },
    { id: 'matrix' as const, label: t('tabs.matrix'), icon: BarChart3 },
    { id: 'plans' as const, label: t('tabs.plans'), icon: Package },
  ];

  return (
    <div className="grid gap-2 rounded-3xl border border-teal-100 bg-white/90 p-1.5 shadow-glass sm:grid-cols-2 xl:grid-cols-5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={cx(
              'flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black transition',
              active ? 'bg-primary text-white shadow-lg shadow-teal-100' : 'text-stone-500 hover:bg-teal-50 hover:text-primary',
            )}
            onClick={() => onChange(tab.id)}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
