'use client';

import { LockKeyhole, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, PrimaryButton, SectionTitle } from '@/components/ui/dashboard-ui';
import { usePathname, useRouter } from 'next/navigation';

export function FinanceLockedState() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();

  const openSupportSettings = () => {
    const params = new URLSearchParams({
      tab: 'settings',
      settings: 'support',
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('financialsEyebrow')} title={t('financialsTitle')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="amber">{t('financeLockedBadge')}</Badge>
        </div>
      </SectionTitle>
      <Card className="border-amber-100 bg-amber-50/70 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
              <LockKeyhole className="size-6" />
            </span>
            <div>
              <h3 className="text-lg font-black text-stone-950">{t('financeLockedTitle')}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('financeLockedBody')}
              </p>
            </div>
          </div>
          <PrimaryButton className="shrink-0" onClick={openSupportSettings}>
            <WalletCards className="size-4" />
            {t('viewPlans')}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
