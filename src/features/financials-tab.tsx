'use client';

import { FinancialLaunchpadTab } from '@/features/financial/components/financial-launchpad-tab';

export function FinancialsTab({ locale, currency }: { locale: string; currency: string }) {
  return <FinancialLaunchpadTab locale={locale} currency={currency} />;
}
