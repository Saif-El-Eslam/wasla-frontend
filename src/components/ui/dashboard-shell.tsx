'use client';

import Link from 'next/link';
import {
  Building2,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  UtensilsCrossed,
  WalletCards,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { publicLandingHref } from '@/features/auth/utils/pwa-public-navigation';
import type { DashboardTab } from '@/features/dashboard/types/dashboard-types';
import { cx } from './cx';
import { LogoMark } from './logo-mark';

const navItems: Array<{
  id: DashboardTab;
  labelKey: 'home' | 'menu' | 'branches' | 'financials' | 'more';
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}> = [
  { id: 'overview', labelKey: 'home', icon: LayoutDashboard },
  { id: 'branches', labelKey: 'branches', icon: Building2 },
  { id: 'menu', labelKey: 'menu', icon: UtensilsCrossed },
  { id: 'financials', labelKey: 'financials', icon: WalletCards },
  { id: 'settings', labelKey: 'more', icon: MoreHorizontal },
];

export function DashboardShell({
  venueName,
  activeTab,
  onTabChange,
  onLogout,
  locale,
  onLocaleChange,
  logoutPending,
  children,
}: {
  venueName: string;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  locale: string;
  onLocaleChange: (locale: string) => void;
  logoutPending: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');

  return (
    <div className="h-dvh overflow-hidden bg-[#f8fafa]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex h-full min-h-0">
        <aside className="hidden h-full w-64 shrink-0 flex-col bg-[#042f2e] lg:flex">
          <Link
            href={publicLandingHref(locale)}
            className="flex items-center gap-3 px-5 py-6 transition hover:bg-white/5"
          >
            <LogoMark className="flex size-10 items-center justify-center text-lg font-black text-white shadow-lg" />
            <div>
              <p className="text-lg font-black text-white">{commonT('wasla')}</p>
              <p className="text-xs text-teal-200">{venueName || t('venueWorkspace')}</p>
            </div>
          </Link>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition',
                    active
                      ? 'bg-teal-500/20 text-teal-200'
                      : 'text-white/55 hover:bg-white/5 hover:text-white',
                  )}
                  onClick={() => onTabChange(item.id)}
                  type="button"
                >
                  <Icon className="size-5" />
                  <span>{t(item.labelKey)}</span>
                  {item.comingSoon ? (
                    <span className="ms-auto rounded-full border border-amber-300/30 bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-black text-amber-200">
                      {t('comingSoon')}
                    </span>
                  ) : active ? (
                    <span className="ms-auto size-1.5 rounded-full bg-teal-300" />
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="space-y-2 border-t border-white/10 p-3">
            <button
              className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white"
              onClick={() => onLocaleChange(locale === 'ar' ? 'en' : 'ar')}
              type="button"
            >
              <span className="flex size-4 items-center justify-center text-xs font-black">文</span>
              {t('languageName')}
            </button>
            {/* <button
              className="flex h-11 w-full items-center gap-2 rounded-xl border border-teal-400/20 bg-teal-400/10 px-3 text-sm font-bold text-teal-200 transition hover:bg-teal-400/15"
              onClick={onPreview}
              type="button"
            >
              <Eye className="size-4" />
              {t('publicPreview')}
            </button> */}
            <button
              className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              onClick={onLogout}
              disabled={logoutPending}
              type="button"
            >
              <LogOut className="size-4" />
              {t('signOut')}
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-[#f8fafa]/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link
                href={publicLandingHref(locale)}
                className="flex min-w-0 items-center gap-2.5 rounded-2xl text-start transition hover:bg-white/60"
              >
                <LogoMark className="flex size-9 shrink-0 items-center justify-center text-sm font-black text-white" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-stone-950">
                    {venueName || commonT('wasla')}
                  </p>
                  <p className="text-xs text-muted-foreground">{commonT('wasla')}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-10 items-center justify-center rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-600 transition hover:border-primary hover:text-primary"
                  onClick={() => onLocaleChange(locale === 'ar' ? 'en' : 'ar')}
                  type="button"
                >
                  {t('languageShort')}
                </button>
                {/* <IconButton label={t('publicPreview')} onClick={onPreview}>
                  <Eye className="size-4" />
                </IconButton> */}
                {/* <IconButton label={t('notifications')}>
                  <Bell className="size-4" />
                </IconButton> */}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-[#f8fafa]/90 px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 backdrop-blur lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  className={cx(
                    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition',
                    active ? 'text-primary' : 'text-stone-400',
                  )}
                  onClick={() => onTabChange(item.id)}
                  type="button"
                >
                  <span className="relative">
                    <Icon className={cx('size-5', active ? 'stroke-[2.5]' : '')} />
                    {item.comingSoon ? (
                      <span className="absolute -end-1 -top-1 size-2 rounded-full bg-amber-500 ring-2 ring-[#f8fafa]" />
                    ) : null}
                  </span>
                  <span className="max-w-full truncate text-xs">{t(item.labelKey)}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
