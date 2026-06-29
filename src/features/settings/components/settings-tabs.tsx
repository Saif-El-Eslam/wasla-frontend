'use client';

import { LifeBuoy, LockKeyhole, Store, UserRound, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cx } from '@/components/ui/dashboard-ui';

export type SettingsTabId = 'user' | 'password' | 'venue' | 'team' | 'support';

export function SettingsTabs({
  activeTab,
  onChange,
  isAdmin,
}: {
  activeTab: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
  isAdmin: boolean;
}) {
  const t = useTranslations('dashboard');
  const settingsTabs = [
    { id: 'user' as const, label: t('user'), icon: UserRound, show: true },
    { id: 'password' as const, label: t('password'), icon: LockKeyhole, show: true },
    { id: 'venue' as const, label: t('venue'), icon: Store, show: isAdmin },
    { id: 'team' as const, label: t('team'), icon: Users, show: isAdmin },
    { id: 'support' as const, label: t('support'), icon: LifeBuoy, show: true },
  ].filter((tab) => tab.show);

  return (
    <div className="grid gap-2 rounded-3xl border border-teal-100 bg-white/90 p-1.5 shadow-glass sm:grid-cols-2 lg:grid-cols-5">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            className={cx(
              'flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black transition',
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-teal-100'
                : 'text-stone-500 hover:bg-teal-50 hover:text-primary',
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
