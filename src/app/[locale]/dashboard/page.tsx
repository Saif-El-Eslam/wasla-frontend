'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { BranchesTab } from '@/features/branches/components/branches-tab';
import { Badge, Card, DashboardShell, PrimaryButton, QueryErrorState, type DashboardTab } from '@/components/ui/dashboard-ui';
import { DashboardLoading } from '@/components/ui/dashboard-loading';
import { FinancialsTab } from '@/features/financials-tab';
import type { FinancePanel } from '@/features/financial/components/finance-ui';
import { MenuLaunchpadTab, type MenuHubPanel } from '@/features/menu/components/menu-launchpad-tab';
import { OverviewTab } from '@/features/home/components/overview-tab';
// import { PublicPreview } from '@/features/public/menu/components/menu/public-preview';
import { SettingsTab } from '@/features/settings/components/settings-tab';
import { useMe } from '@/features/auth/hooks/use-me';
import { useVenue } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';
import { confirmDiscardChanges } from '@/lib/unsaved-changes';

const dashboardTabs: DashboardTab[] = ['overview', 'branches', 'menu', 'financials', 'settings'];
const legacyMenuPanelTabs: MenuHubPanel[] = ['qr', 'analytics', 'feedback'];
const menuPanels: MenuHubPanel[] = ['menu', 'qr', 'analytics', 'feedback'];
const financePanels: FinancePanel[] = ['add', 'transactions', 'reports', 'categories', 'paymentMethods'];

function dashboardTabFromUrl(tab: string | null): DashboardTab {
  if (legacyMenuPanelTabs.includes(tab as MenuHubPanel)) {
    return 'menu';
  }

  return dashboardTabs.includes(tab as DashboardTab) ? (tab as DashboardTab) : 'overview';
}

function menuPanelFromUrl(tab: string | null): MenuHubPanel | null {
  return legacyMenuPanelTabs.includes(tab as MenuHubPanel) ? (tab as MenuHubPanel) : null;
}

function dashboardPanelFromUrl(panel: string | null): MenuHubPanel | null {
  return menuPanels.includes(panel as MenuHubPanel) ? (panel as MenuHubPanel) : null;
}

function financePanelFromUrl(panel: string | null): FinancePanel | null {
  return financePanels.includes(panel as FinancePanel) ? (panel as FinancePanel) : null;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();
  const queryClient = useQueryClient();
  const locale = params.locale ?? 'en';
  const me = useMe();
  const venue = useVenue();
  const isAdmin = me.data?.role === 'OWNER' || me.data?.role === 'MANAGER';
  const activeTab = dashboardTabFromUrl(searchParams.get('tab'));
  const [selectedMenuBranchId, setSelectedMenuBranchId] = useState('');
  const [selectedQrBranchId, setSelectedQrBranchId] = useState('');
  const [selectedAnalyticsBranchId, setSelectedAnalyticsBranchId] = useState('all');
  const activeMenuPanel =
    dashboardPanelFromUrl(searchParams.get('panel')) ?? menuPanelFromUrl(searchParams.get('tab'));
  const activeFinancePanel = financePanelFromUrl(searchParams.get('finance'));
  // const [publicPreviewOpen, setPublicPreviewOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
      router.push(`/${locale}/login`);
    },
  });

  const changeDashboardTab = useCallback(
    (tab: DashboardTab) => {
      if (!confirmDiscardChanges(commonT('unsavedChangesWarning'))) return;
      const nextParams = new URLSearchParams(searchParams.toString());

      if (tab === 'overview') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', tab);
      }

      nextParams.delete('panel');
      nextParams.delete('finance');
      nextParams.delete('settings');
      nextParams.delete('menuView');

      const query = nextParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [commonT, pathname, router, searchParams],
  );

  const changeMenuPanel = useCallback(
    (panel: MenuHubPanel | null) => {
      if (!confirmDiscardChanges(commonT('unsavedChangesWarning'))) return;
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('tab', 'menu');
      nextParams.delete('finance');
      nextParams.delete('settings');

      if (panel) {
        nextParams.set('panel', panel);
      } else {
        nextParams.delete('panel');
        nextParams.delete('menuView');
      }

      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
    },
    [commonT, pathname, router, searchParams],
  );

  const changeFinancePanel = useCallback(
    (panel: FinancePanel | null) => {
      if (!confirmDiscardChanges(commonT('unsavedChangesWarning'))) return;
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('tab', 'financials');
      nextParams.delete('panel');
      nextParams.delete('settings');
      nextParams.delete('menuView');

      if (panel) {
        nextParams.set('finance', panel);
      } else {
        nextParams.delete('finance');
      }

      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
    },
    [commonT, pathname, router, searchParams],
  );

  const changeLocale = (nextLocale: string) => {
    const query = searchParams.toString();
    router.push(`/${nextLocale}/dashboard${query ? `?${query}` : ''}`);
  };

  if (me.isLoading || venue.isLoading) {
    return <DashboardLoading />;
  }

  if (venue.isError) {
    if (!(venue.error instanceof ApiError) || venue.error.status !== 404) {
      return (
        <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4">
          <div className="w-full max-w-lg">
            <QueryErrorState onRetry={() => void venue.refetch()} />
          </div>
        </main>
      );
    }

    return (
      <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4">
        <Card className="w-full max-w-md">
          <Badge tone="amber">{t('setupRequired')}</Badge>
          <h1 className="mt-3 text-2xl font-black text-stone-950">{t('venueSetupRequired')}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('venueSetupRequiredBody')}</p>
          <div className="mt-4">
            <PrimaryButton onClick={() => router.push(`/${locale}/dashboard/setup`)}>
              <Plus className="size-4" />
              {t('setUpVenue')}
            </PrimaryButton>
          </div>
        </Card>
      </main>
    );
  }

  const hasNoBranchAccess =
    !isAdmin &&
    Boolean(me.data?.venueId) &&
    (me.data?.branches?.filter((branch) => branch.active).length ?? 0) === 0;

  if (hasNoBranchAccess) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4">
        <Card className="w-full max-w-md border-teal-100 bg-white p-5">
          <Badge tone="amber">{t('branchAccessRequired')}</Badge>
          <h1 className="mt-3 text-2xl font-black text-stone-950">{t('noBranchAccessTitle')}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('noBranchAccessBody')}</p>
          <div className="mt-4">
            <PrimaryButton onClick={() => logoutMutation.mutate()} loading={logoutMutation.isPending}>
              {t('logout')}
            </PrimaryButton>
          </div>
        </Card>
      </main>
    );
  }

  const venueName = textForLocale(venue.data?.name, locale) || t('waslaWorkspace');

  return (
    <>
      <DashboardShell
        venueName={venueName}
        activeTab={activeTab}
        onTabChange={changeDashboardTab}
        // onPreview={() => setPublicPreviewOpen(true)}
        onLogout={() => logoutMutation.mutate()}
        locale={locale}
        onLocaleChange={changeLocale}
        logoutPending={logoutMutation.isPending}
      >
        {activeTab === 'overview' ? <OverviewTab locale={locale} /> : null}
        {activeTab === 'menu' ? (
          <MenuLaunchpadTab
            activePanel={activeMenuPanel}
            onActivePanelChange={changeMenuPanel}
            locale={locale}
            currency={venue.data?.currency ?? 'EGP'}
            selectedMenuBranchId={selectedMenuBranchId}
            selectedQrBranchId={selectedQrBranchId}
            selectedAnalyticsBranchId={selectedAnalyticsBranchId}
            onAnalyticsBranchChange={setSelectedAnalyticsBranchId}
          />
        ) : null}
        {activeTab === 'branches' ? (
          <BranchesTab
            locale={locale}
            onOpenMenu={(branchId) => {
              setSelectedMenuBranchId(branchId);
              changeMenuPanel('menu');
            }}
            onOpenQr={(branchId) => {
              setSelectedQrBranchId(branchId);
              changeMenuPanel('qr');
            }}
            onOpenStats={(branchId) => {
              setSelectedAnalyticsBranchId(branchId);
              changeMenuPanel('analytics');
            }}
          />
        ) : null}
        {activeTab === 'financials' ? (
          <FinancialsTab
            activePanel={activeFinancePanel}
            onActivePanelChange={changeFinancePanel}
            locale={locale}
            currency={venue.data?.currency ?? 'EGP'}
          />
        ) : null}
        {activeTab === 'settings' ? (
          <SettingsTab
            isAdmin={isAdmin}
            me={me}
            locale={locale}
            onLogout={() => logoutMutation.mutate()}
            logoutPending={logoutMutation.isPending}
          />
        ) : null}
      </DashboardShell>
      {/* {publicPreviewOpen ? (
        <PublicPreview
          venueName={venueName}
          branchId={previewBranchId}
          locale={locale}
          currency={venue.data?.currency ?? 'EGP'}
          onClose={() => setPublicPreviewOpen(false)}
        />
      ) : null} */}
    </>
  );
}










