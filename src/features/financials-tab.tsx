'use client';

import { Bell, LockKeyhole, ReceiptText, WalletCards } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, SectionTitle } from '@/components/ui/dashboard-ui';

export function FinancialsTab() {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('financialsEyebrow')} title={t('financialsTitle')}>
        <Badge tone="amber">{t('comingSoon')}</Badge>
      </SectionTitle>

      <Card className="overflow-hidden border-stone-200 bg-stone-100/80 p-0 grayscale-[0.25]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-[360px] flex-col justify-between bg-stone-900 p-6 text-white sm:p-8">
            <div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/12">
                <WalletCards className="size-7" />
              </div>
              <h3 className="mt-6 max-w-md text-2xl font-black">{t('financialsComingTitle')}</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-stone-300">{t('financialsComingBody')}</p>
            </div>
            <button
              type="button"
              className="mt-8 hidden h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-stone-950 shadow-lg transition hover:bg-stone-100"
            >
              <Bell className="size-4" />
              {t('notifyMe')}
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            {[
              {
                icon: ReceiptText,
                title: t('financialsPreviewSales'),
                body: t('financialsPreviewSalesBody'),
                value: 'EGP 18.4k',
              },
              {
                icon: LockKeyhole,
                title: t('financialsPreviewCosts'),
                body: t('financialsPreviewCostsBody'),
                value: '32%',
              },
              {
                icon: WalletCards,
                title: t('financialsPreviewCashflow'),
                body: t('financialsPreviewCashflowBody'),
                value: '+9.8%',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                      <Icon className="size-5" />
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-black text-stone-600">
                      {item.value}
                    </span>
                  </div>
                  <h4 className="mt-4 text-sm font-black text-stone-950">{item.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
