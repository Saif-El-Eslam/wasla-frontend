'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AnalyticsTab } from '@/features/analytics/components/analytics-tab';
import { BranchesTab } from '@/features/branches/components/branches-tab';
import { Badge, Card, DashboardShell, PrimaryButton, type DashboardTab } from '@/components/ui/dashboard-ui';
import { MenuTab } from '@/features/menu/components/menu-tab';
import { OverviewTab } from '@/features/home/components/overview-tab';
// import { PublicPreview } from '@/features/public/menu/components/menu/public-preview';
import { QrTab } from '@/features/qr/components/qr-tab';
import { SettingsTab } from '@/features/settings/components/settings-tab';
import { useMe } from '@/features/auth/hooks/use-me';
import { useVenue } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const queryClient = useQueryClient();
  const locale = params.locale ?? 'en';
  const me = useMe();
  const venue = useVenue();
  const isAdmin = me.data?.role === 'OWNER' || me.data?.role === 'MANAGER';
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
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

  const changeLocale = (nextLocale: string) => {
    router.push(`/${nextLocale}/dashboard`);
  };

  if (me.isLoading || venue.isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4">
        <Card className="w-full max-w-sm text-center">
          <div className="mx-auto size-10 animate-pulse rounded-2xl bg-teal-100" />
          <p className="mt-3 text-sm font-bold text-muted-foreground">{t('loadingWorkspace')}</p>
        </Card>
      </main>
    );
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

  const venueName = textForLocale(venue.data?.name, locale) || t('waslaWorkspace');
  const previewBranchId = selectedMenuBranchId || selectedQrBranchId || '';

  return (
    <>
      <DashboardShell
        venueName={venueName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
              setActiveTab('menu');
            }}
            onOpenQr={(branchId) => {
              setSelectedQrBranchId(branchId);
              setActiveTab('qr');
            }}
            onOpenStats={(branchId) => {
              setSelectedAnalyticsBranchId(branchId);
              setActiveTab('analytics');
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
