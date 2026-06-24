'use client';

import { Building2, FileText, QrCode, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, SectionTitle, TabLoader, cx } from '@/components/ui/dashboard-ui';
import { useBranchOverview } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

export function OverviewTab({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const overview = useBranchOverview();

  if (overview.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  const branches = overview.data?.branches ?? [];
  const totals = overview.data?.totals ?? { menus: 0, items: 0, views: 0, scans: 0 };
  const isAdmin = Boolean(overview.data?.isAdmin);
  const userCount = overview.data?.userCount ?? 0;

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('overviewEyebrow')} title={t('overviewTitle')} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('branches'), value: branches.length, icon: Building2, accent: true },
          { label: t('menusReady'), value: totals.menus, icon: UtensilsCrossed },
          { label: t('menuItems'), value: totals.items, icon: FileText },
          { label: t('qrScans'), value: totals.scans, icon: QrCode },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className={cx(stat.accent && 'bg-gradient-to-br from-teal-600 to-teal-700 text-white')}>
              <div className={cx('flex size-10 items-center justify-center rounded-2xl', stat.accent ? 'bg-white/20' : 'bg-teal-50 text-primary')}>
                <Icon className="size-5" />
              </div>
              <p className={cx('mt-4 text-3xl font-black', stat.accent ? 'text-white' : 'text-stone-950')}>{stat.value.toLocaleString()}</p>
              <p className={cx('text-sm', stat.accent ? 'text-teal-100' : 'text-muted-foreground')}>{stat.label}</p>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <SectionTitle eyebrow={t('branchHealth')} title={t('currentWorkspaces')} />
          <div className="mt-4 space-y-2">
            {branches.length > 0 ? (
              branches.map((branch) => {
                const stats = branch.stats;

                return (
                  <div key={branch.id} className="grid gap-3 rounded-xl bg-stone-50 px-3 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div>
                      <p className="font-bold text-stone-900">{textForLocale(branch.name, locale) || branch.slug}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.hasMenu
                          ? t('categoriesAndItems', { categories: stats.categories, items: stats.items })
                          : t('noMenuYet')}
                      </p>
                    </div>
                    <Badge tone={branch.active ? 'green' : 'muted'}>
                      {branch.active ? t('active') : t('inactive')}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {stats.scans.toLocaleString()} {t('scans')}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-stone-50 p-4 text-sm text-muted-foreground">{t('noBranchesYet')}</p>
            )}
          </div>
        </Card>
        <Card>
          <SectionTitle eyebrow={t('access')} title={t('teamAndActivity')} />
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-teal-50 p-3">
              <p className="text-sm font-bold text-teal-800">
                {isAdmin ? t('usersInVenue', { count: userCount }) : t('branchScopedAccount')}
              </p>
              <p className="text-xs text-teal-700">{t('settingsControlsDepend')}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-800">
                {t('totalViews', { count: totals.views.toLocaleString() })}
              </p>
              <p className="text-xs text-amber-700">{t('accumulatedFromBranches')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

