'use client';

import { useEffect, useMemo, useState } from 'react';
import { Landmark, ListTree, PlusCircle, ReceiptText, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, SectionTitle, TabLoader } from '@/components/ui/dashboard-ui';
import { useMe } from '@/features/auth/hooks/use-me';
import type { BranchOption } from '@/lib/api';
import { FinanceLockedState } from './finance-locked-state';
import { FinanceSummaryCards } from './finance-summary-cards';
import { AddTransactionPanel } from './add-transaction-panel';
import { CategoriesPanel } from './categories-panel';
import { FinancialHubDrawer } from './financial-hub-drawer';
import { FinanceCard, type FinanceLaunchpadCard, type FinancePanel } from './finance-ui';
import { PaymentMethodsPanel } from './payment-methods-panel';
import { ReportsPanel } from './reports-panel';
import { TransactionsPanel } from './transactions-panel';
import { useFinanceAccess, useFinanceDashboard } from '../hooks/use-financial';

export function FinancialLaunchpadTab({ locale, currency }: { locale: string; currency: string }) {
  const t = useTranslations('dashboard');
  const me = useMe();
  const access = useFinanceAccess();
  const canUseFinance = Boolean(access.data?.allowance.canUseFinance);
  const dashboard = useFinanceDashboard({}, canUseFinance);
  const [activePanel, setActivePanel] = useState<FinancePanel | null>(null);
  const [renderedPanel, setRenderedPanel] = useState<FinancePanel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = access.data?.isAdmin ?? (me.data?.role === 'OWNER' || me.data?.role === 'MANAGER');
  const timeZone = access.data?.timeZone;

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

  const cards = useMemo<FinanceLaunchpadCard[]>(() => {
    const month = dashboard.data?.dashboard.month;

    return [
      {
        id: 'add',
        title: t('addTransaction'),
        description: t('addTransactionCardBody'),
        metric: t('quickEntry'),
        icon: PlusCircle,
        accent: 'from-emerald-500 to-teal-500',
      },
      {
        id: 'transactions',
        title: t('transactions'),
        description: t('transactionsCardBody'),
        metric: t('transactionsCount', { count: month?.count ?? 0 }),
        icon: ReceiptText,
        accent: 'from-stone-700 to-stone-950',
      },
      {
        id: 'reports',
        title: t('reports'),
        description: t('financeReportsCardBody'),
        metric: t('historyMonths', { count: access.data?.allowance.historyMonths ?? 3 }),
        icon: Landmark,
        accent: 'from-amber-500 to-orange-500',
      },
      {
        id: 'categories',
        title: t('financeCategories'),
        description: t('financeCategoriesCardBody'),
        metric: t('adminOnly'),
        icon: ListTree,
        accent: 'from-teal-500 to-cyan-500',
        adminOnly: true,
      },
      {
        id: 'paymentMethods',
        title: t('paymentMethods'),
        description: t('paymentMethodsCardBody'),
        metric: t('adminOnly'),
        icon: WalletCards,
        accent: 'from-violet-500 to-fuchsia-500',
        adminOnly: true,
      },
    ];
  }, [access.data?.allowance.historyMonths, dashboard.data?.dashboard.month, t]);

  if (access.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (!canUseFinance) {
    return <FinanceLockedState />;
  }

  const activeCards = cards.filter((card) => !card.adminOnly || isAdmin);
  const panelTitle = renderedPanel ? (cards.find((card) => card.id === renderedPanel)?.title ?? '') : '';
  const branches = (dashboard.data?.dashboard.branches ?? []).map((branch) => ({
    ...branch,
    isMain: Boolean(branch.isMain),
  })) satisfies BranchOption[];

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('financialsEyebrow')} title={t('financialsTitle')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{t('financeActive')}</Badge>
          <Badge tone="amber">
            {t('historyMonths', { count: access.data?.allowance.historyMonths ?? 3 })}
          </Badge>
        </div>
      </SectionTitle>

      {dashboard.data?.dashboard ? (
        <FinanceSummaryCards
          today={dashboard.data.dashboard.today}
          month={dashboard.data.dashboard.month}
          currency={currency}
        />
      ) : null}

      <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-glass sm:p-5">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {activeCards.map((card) => (
            <FinanceCard key={card.id} card={card} onClick={() => setActivePanel(card.id)} />
          ))}
        </div>
      </div>

      {renderedPanel ? (
        <FinancialHubDrawer
          open={drawerOpen}
          title={panelTitle}
          hubLabel={t('financials')}
          closeLabel={t('close')}
          onClose={() => setActivePanel(null)}
        >
          {renderedPanel === 'add' ? (
            <AddTransactionPanel
              branches={branches}
              locale={locale}
              timeZone={timeZone}
              onClose={() => setActivePanel(null)}
            />
          ) : null}
          {renderedPanel === 'transactions' ? (
            <TransactionsPanel locale={locale} currency={currency} timeZone={timeZone} />
          ) : null}
          {renderedPanel === 'reports' ? (
            <ReportsPanel branches={branches} locale={locale} currency={currency} />
          ) : null}
          {renderedPanel === 'categories' ? <CategoriesPanel locale={locale} /> : null}
          {renderedPanel === 'paymentMethods' ? <PaymentMethodsPanel locale={locale} /> : null}
        </FinancialHubDrawer>
      ) : null}
    </div>
  );
}
