'use client';

import { useEffect, useState } from 'react';
import { BarChart3, MessageSquareHeart, QrCode, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FeedbackTab } from '@/features/feedback/components/feedback-tab';
import { AnalyticsTab } from '@/features/menu/analytics/components/analytics-tab';
import { QrTab } from '@/features/menu/qr/components/qr-tab';
import { useBranchOverview } from '@/features/venue/hooks/use-venue';
import { Badge, SectionTitle, TabLoader } from '@/components/ui/dashboard-ui';
import { MenuHubDrawer } from './menu-hub-drawer';
import { MenuLaunchpadCard } from './menu-launchpad-card';
import { MenuLaunchpadPreviewCard } from './menu-launchpad-preview-card';
import type { LaunchpadCard, MenuHubPanel } from './menu-launchpad-types';
import { MenuTab } from './menu-tab';

export type { MenuHubPanel } from './menu-launchpad-types';

type MenuLaunchpadTabProps = {
  locale: string;
  currency: string;
  selectedMenuBranchId: string;
  selectedQrBranchId: string;
  selectedAnalyticsBranchId: string;
  onAnalyticsBranchChange: (branchId: string) => void;
  activePanel: MenuHubPanel | null;
  onActivePanelChange: (panel: MenuHubPanel | null) => void;
};

export function MenuLaunchpadTab({
  locale,
  currency,
  selectedMenuBranchId,
  selectedQrBranchId,
  selectedAnalyticsBranchId,
  onAnalyticsBranchChange,
  activePanel,
  onActivePanelChange,
}: MenuLaunchpadTabProps) {
  const t = useTranslations('dashboard');
  const overview = useBranchOverview();
  const [renderedPanel, setRenderedPanel] = useState<MenuHubPanel | null>(activePanel);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totals = overview.data?.totals ?? { menus: 0, items: 0, views: 0, scans: 0 };
  const branches = overview.data?.branches ?? [];
  const activeItems = totals.items;
  const qrScans = totals.scans;
  const overallViews = totals.views;
  const readyMenus = totals.menus || branches.filter((branch) => branch.hasMenu).length;

  const cards: LaunchpadCard[] = [
    {
      id: 'menu',
      title: t('hubMenuManagementTitle'),
      description: t('hubMenuManagementBody'),
      metric: t('hubMenuManagementMetric', { count: activeItems }),
      metricTone: 'bg-teal-50 text-teal-800',
      icon: UtensilsCrossed,
      accent: 'from-teal-500 to-emerald-500',
      visual: 'items',
    },
    {
      id: 'qr',
      title: t('hubQrTitle'),
      description: t('hubQrBody'),
      metric: t('hubQrMetric', { count: qrScans }),
      metricTone: 'bg-amber-50 text-amber-800',
      icon: QrCode,
      accent: 'from-amber-500 to-orange-500',
      visual: 'qr',
    },
    {
      id: 'analytics',
      title: t('hubAnalyticsTitle'),
      description: t('hubAnalyticsBody'),
      metric: t('hubAnalyticsMetric', { count: overallViews }),
      metricTone: 'bg-indigo-50 text-indigo-800',
      icon: BarChart3,
      accent: 'from-indigo-500 to-sky-500',
      visual: 'chart',
    },
    {
      id: 'feedback',
      title: t('hubFeedbackTitle'),
      description: t('hubFeedbackBody'),
      metric: t('hubFeedbackMetric'),
      metricTone: 'bg-rose-50 text-rose-800',
      icon: MessageSquareHeart,
      accent: 'from-rose-500 to-amber-500',
      visual: 'chart',
    },
  ];

  useEffect(() => {
    const timers: number[] = [];

    if (activePanel) {
      timers.push(window.setTimeout(() => setRenderedPanel(activePanel), 0));
      timers.push(window.setTimeout(() => setDrawerOpen(true), 24));
    } else {
      timers.push(window.setTimeout(() => setDrawerOpen(false), 0));
      timers.push(window.setTimeout(() => setRenderedPanel(null), 260));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activePanel]);

  const panelTitle =
    renderedPanel === 'menu'
      ? t('hubMenuManagementTitle')
      : renderedPanel === 'qr'
        ? t('hubQrTitle')
        : renderedPanel === 'analytics'
          ? t('hubAnalyticsTitle')
          : renderedPanel === 'feedback'
            ? t('hubFeedbackTitle')
            : '';

  if (overview.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('menuHubEyebrow')} title={t('menuHubTitle')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{t('menuHubReadyMenus', { count: readyMenus })}</Badge>
          <Badge tone="amber">{t('menuHubFastAccess')}</Badge>
        </div>
      </SectionTitle>

      <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-glass sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {cards.map((card) => (
            <MenuLaunchpadCard
              key={card.id}
              card={card}
              onClick={() => onActivePanelChange(card.id)}
              openLabel={t('open')}
            />
          ))}
          <MenuLaunchpadPreviewCard
            title={t('hubPreviewTitle')}
            description={t('hubPreviewBody')}
            metric={t('comingSoon')}
            notifyLabel={t('notifyMe')}
          />
        </div>
      </div>

      {renderedPanel ? (
        <MenuHubDrawer
          open={drawerOpen}
          title={panelTitle}
          hubLabel={t('menu')}
          closeLabel={t('close')}
          onClose={() => onActivePanelChange(null)}
        >
          {renderedPanel === 'menu' ? (
            <MenuTab initialBranchId={selectedMenuBranchId} locale={locale} currency={currency} />
          ) : null}
          {renderedPanel === 'qr' ? <QrTab initialBranchId={selectedQrBranchId} locale={locale} /> : null}
          {renderedPanel === 'analytics' ? (
            <AnalyticsTab
              selectedBranchId={selectedAnalyticsBranchId}
              onBranchChange={onAnalyticsBranchChange}
              locale={locale}
            />
          ) : null}
          {renderedPanel === 'feedback' ? <FeedbackTab locale={locale} /> : null}
        </MenuHubDrawer>
      ) : null}
    </div>
  );
}
