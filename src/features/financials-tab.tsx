'use client';

import { FinancialLaunchpadTab } from '@/features/financial/components/financial-launchpad-tab';
import type { FinancePanel } from '@/features/financial/components/finance-ui';

export function FinancialsTab({
  locale,
  currency,
  activePanel,
  onActivePanelChange,
}: {
  locale: string;
  currency: string;
  activePanel: FinancePanel | null;
  onActivePanelChange: (panel: FinancePanel | null) => void;
}) {
  return (
    <FinancialLaunchpadTab
      activePanel={activePanel}
      onActivePanelChange={onActivePanelChange}
      locale={locale}
      currency={currency}
    />
  );
}

