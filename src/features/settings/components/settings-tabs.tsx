'use client';

import {
  ChevronRight,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Store,
  UserRound,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cx } from '@/components/ui/dashboard-ui';

export type SettingsTabId = 'user' | 'password' | 'venue' | 'team' | 'subscription' | 'app' | 'support';

export function SettingsTabs({
  activeTab,
  onChange,
  isAdmin,
  onLogout,
  logoutPending,
}: {
  activeTab: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
  isAdmin: boolean;
  onLogout?: () => void;
  logoutPending?: boolean;
}) {
  const t = useTranslations('dashboard');
  const settingsTabs = [
    { id: 'user' as const, label: t('user'), icon: UserRound, show: true },
    { id: 'password' as const, label: t('password'), icon: LockKeyhole, show: true },
    { id: 'venue' as const, label: t('venue'), icon: Store, show: isAdmin },
    { id: 'team' as const, label: t('team'), icon: Users, show: isAdmin },
    // { id: 'subscription' as const, label: t('subscription'), icon: CreditCard, show: true },
    // { id: 'app' as const, label: t('appInstall'), icon: Smartphone, show: true },
    { id: 'support' as const, label: t('support'), icon: LifeBuoy, show: true },
  ].filter((tab) => tab.show);

  return (
    <>
      <div className="space-y-2 sm:hidden">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={cx(
                'flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-white px-3 text-start shadow-glass transition',
                active
                  ? 'border-primary text-primary'
                  : 'border-teal-100 text-stone-600 hover:border-primary/40 hover:text-primary',
              )}
              onClick={() => onChange(tab.id)}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cx(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  active ? 'bg-primary text-white' : 'bg-teal-50 text-primary',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-black">{tab.label}</span>
              <ChevronRight className="size-4 shrink-0 text-stone-300 rtl:rotate-180" />
            </button>
          );
        })}
        {onLogout ? (
          <button
            type="button"
            className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-red-100 bg-white px-3 text-start text-red-600 shadow-glass transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
            onClick={onLogout}
            disabled={logoutPending}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <LogOut className="size-5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-black">{t('logout')}</span>
          </button>
        ) : null}
      </div>

      <div className="hidden gap-2 rounded-3xl border border-teal-100 bg-white/90 p-1.5 shadow-glass sm:grid sm:grid-cols-2 lg:grid-cols-7">
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
    </>
  );
}
