'use client';

import { CalendarClock, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card } from '@/components/ui/dashboard-ui';
import type { AdminSubscriptionOverview } from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { formatAdminMoney, renewalWhatsappUrl } from '../utils/admin-subscriptions';

export function AdminMetricsGrid({
  metrics,
  locale,
}: {
  metrics: AdminSubscriptionOverview['metrics'] | undefined;
  locale: string;
}) {
  const t = useTranslations('admin');
  const items = [
    [t('metrics.venues'), metrics?.venues ?? 0],
    [t('metrics.paidSubscriptions'), metrics?.paidSubscriptions ?? 0],
    [t('metrics.pastDue'), metrics?.pastDue ?? 0],
    [t('metrics.annualRunRate'), formatAdminMoney(metrics?.activeRevenueAnnualEgp ?? 0, locale)],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <Card key={label} className="border-teal-100 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-black text-stone-950">{value}</p>
        </Card>
      ))}
    </div>
  );
}

export function ExpiringSoonPanel({
  expiringSoon,
  locale,
}: {
  expiringSoon: AdminSubscriptionOverview['expiringSoon'];
  locale: string;
}) {
  const t = useTranslations('admin');

  return (
    <Card className="border-teal-100 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <CalendarClock className="size-5 text-primary" />
        <h2 className="text-lg font-black text-stone-950">{t('expiring.title')}</h2>
        <Badge tone="teal">{t('expiring.window')}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {expiringSoon.map((item) => {
          const whatsappUrl = renewalWhatsappUrl(item.venue.whatsapp ?? item.venue.phone);

          return (
            <div key={item.id} className="rounded-2xl border border-teal-100 bg-[#f8fafa] p-4">
              <p className="font-black text-stone-950">{textForLocale(item.venue.name, locale)}</p>
              <p className="mt-1 text-xs font-bold text-stone-500">
                {t('expiring.item', {
                  plan: item.plan,
                  date: item.currentPeriodEnds?.slice(0, 10) ?? t('notSet'),
                })}
              </p>
              {whatsappUrl ? (
                <a
                  className="mt-3 inline-flex items-center gap-2 text-sm font-black text-primary"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  {t('expiring.message')}
                </a>
              ) : (
                <p className="mt-3 text-xs font-bold text-stone-400">{t('expiring.noPhone')}</p>
              )}
            </div>
          );
        })}
        {expiringSoon.length === 0 ? (
          <p className="text-sm font-bold text-muted-foreground">{t('expiring.empty')}</p>
        ) : null}
      </div>
    </Card>
  );
}
