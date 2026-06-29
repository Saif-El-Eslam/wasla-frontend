'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AnalyticsTab } from '@/features/analytics/components/analytics-tab';
import { BranchesTab } from '@/features/branches/components/branches-tab';
import { Badge, Card, DashboardShell, PrimaryButton, type DashboardTab } from '@/components/ui/dashboard-ui';
import { DashboardLoading } from '@/components/ui/dashboard-loading';
import { MenuTab } from '@/features/menu/components/menu-tab';
import { OverviewTab } from '@/features/home/components/overview-tab';
// import { PublicPreview } from '@/features/public/menu/components/menu/public-preview';
import { QrTab } from '@/features/qr/components/qr-tab';
import { SettingsTab } from '@/features/settings/components/settings-tab';
import { useMe } from '@/features/auth/hooks/use-me';
import { useVenue } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

const dashboardTabs: DashboardTab[] = ['overview', 'menu', 'qr', 'branches', 'analytics', 'settings'];

function dashboardTabFromUrl(tab: string | null): DashboardTab {
  return dashboardTabs.includes(tab as DashboardTab) ? (tab as DashboardTab) : 'overview';
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();
  const queryClient = useQueryClient();
  const locale = params.locale ?? 'en';
  const me = useMe();
  const venue = useVenue();
  const isAdmin = me.data?.role === 'OWNER' || me.data?.role === 'MANAGER';
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => dashboardTabFromUrl(searchParams.get('tab')));
  const [selectedMenuBranchId, setSelectedMenuBranchId] = useState('');
  const [selectedQrBranchId, setSelectedQrBranchId] = useState('');
  const [selectedAnalyticsBranchId, setSelectedAnalyticsBranchId] = useState('all');
  // const [publicPreviewOpen, setPublicPreviewOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
      router.push(`/${locale}/login`);
    },
  });

  useEffect(() => {
    setActiveTab(dashboardTabFromUrl(searchParams.get('tab')));
  }, [searchParams]);

  const changeDashboardTab = useCallback(
    (tab: DashboardTab) => {
      setActiveTab(tab);

      const nextParams = new URLSearchParams(searchParams.toString());

      if (tab === 'overview') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', tab);
      }

      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const changeLocale = (nextLocale: string) => {
    const query = searchParams.toString();
    router.push(`/${nextLocale}/dashboard${query ? `?${query}` : ''}`);
  };

  if (me.isLoading || venue.isLoading) {
    return <DashboardLoading />;
  }

  if (venue.isError) {
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
    !isAdmin && Boolean(me.data?.venueId) && (me.data?.branches?.filter((branch) => branch.active).length ?? 0) === 0;

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
          <MenuTab
            initialBranchId={selectedMenuBranchId}
            locale={locale}
            currency={venue.data?.currency ?? 'EGP'}
          />
        ) : null}
        {activeTab === 'qr' ? <QrTab initialBranchId={selectedQrBranchId} locale={locale} /> : null}
        {activeTab === 'branches' ? (
          <BranchesTab
            locale={locale}
            onOpenMenu={(branchId) => {
              setSelectedMenuBranchId(branchId);
              changeDashboardTab('menu');
            }}
            onOpenQr={(branchId) => {
              setSelectedQrBranchId(branchId);
              changeDashboardTab('qr');
            }}
            onOpenStats={(branchId) => {
              setSelectedAnalyticsBranchId(branchId);
              changeDashboardTab('analytics');
            }}
          />
        ) : null}
        {activeTab === 'analytics' ? (
          <AnalyticsTab
            selectedBranchId={selectedAnalyticsBranchId}
            onBranchChange={setSelectedAnalyticsBranchId}
            locale={locale}
          />
        ) : null}
        {activeTab === 'settings' ? <SettingsTab isAdmin={isAdmin} me={me} locale={locale} /> : null}
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
