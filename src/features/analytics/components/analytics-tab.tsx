'use client';

import { useState } from 'react';
import { ArrowUpRight, Eye, MapPinned, MessageCircle, Phone, QrCode, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BranchSelect, Card, SectionTitle, TabLoader, cx } from '@/components/ui/dashboard-ui';
import { useAnalyticsSummary, useBranchOptions } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';
import { MiniBars } from './mini-bars';

type Period = '7d' | '30d';

export function AnalyticsTab({
  selectedBranchId,
  onBranchChange,
  locale,
}: {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const [period, setPeriod] = useState<Period>('7d');
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const analytics = useAnalyticsSummary({
    period,
    branchId: selectedBranchId === 'all' ? undefined : selectedBranchId,
  });
  const metrics = analytics.data?.metrics;
  const branchBars = analytics.data?.branchActivity.map((branch) => ({
    label: textForLocale(branch.name, locale) || branch.slug,
    value: branch.value,
  })) ?? [];
  const maxBranch = Math.max(1, ...branchBars.map((bar) => bar.value));
  const actionTotal = Math.max(1, (metrics?.whatsapp.current ?? 0) + (metrics?.calls.current ?? 0) + (metrics?.maps.current ?? 0));
  const topItems = analytics.data?.topItems ?? [];

  if (branchOptions.isLoading || analytics.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={selectedBranchId === 'all' ? t('allBranches') : t('branchFilter')} title={t('analytics')}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(['7d', '30d'] as const).map((item) => (
              <button
                key={item}
                className={cx('h-9 rounded-lg px-3 text-xs font-black transition', period === item ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900')}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <BranchSelect branches={branches} value={selectedBranchId} onChange={onBranchChange} locale={locale} includeAll allLabel={t('allBranches')} />
        </div>
      </SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { key: 'views' as const, label: t('views'), value: metrics?.views.current ?? 0, change: metrics?.views.change ?? 0, icon: Eye, tone: 'text-teal-700 bg-teal-50' },
          { key: 'scans' as const, label: t('qrScans'), value: metrics?.scans.current ?? 0, change: metrics?.scans.change ?? 0, icon: QrCode, tone: 'text-amber-700 bg-amber-50' },
          { key: 'whatsapp' as const, label: t('whatsappMetric'), value: metrics?.whatsapp.current ?? 0, change: metrics?.whatsapp.change ?? 0, icon: MessageCircle, tone: 'text-emerald-700 bg-emerald-50' },
          { key: 'calls' as const, label: t('calls'), value: metrics?.calls.current ?? 0, change: metrics?.calls.change ?? 0, icon: Phone, tone: 'text-stone-900 bg-stone-50' },
          { key: 'maps' as const, label: t('maps'), value: metrics?.maps.current ?? 0, change: metrics?.maps.change ?? 0, icon: MapPinned, tone: 'text-indigo-700 bg-indigo-50' },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <div className={cx('rounded-2xl p-3', metric.tone)}>
                <Icon className="size-4" />
                <p className="mt-2 text-2xl font-black">{metric.value.toLocaleString()}</p>
                <p className="text-xs font-bold">{metric.label}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-black text-emerald-600">
                  <TrendingUp className="size-3" />
                  {t('vsPrevious', { trend: metric.change, period })}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle eyebrow={t('engagement')} title={t('dailyViews')} />
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
              <ArrowUpRight className="size-4" />
              +{metrics?.views.change ?? 0}%
            </span>
          </div>
          <MiniBars data={(analytics.data?.series ?? []).map((item) => ({ label: item.label, value: item.views }))} tone="bg-teal-500" />
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle eyebrow={t('qr')} title={t('dailyScans')} />
            <span className="flex items-center gap-1 text-xs font-black text-amber-600">
              <ArrowUpRight className="size-4" />
              +{metrics?.scans.change ?? 0}%
            </span>
          </div>
          <MiniBars data={(analytics.data?.series ?? []).map((item) => ({ label: item.label, value: item.scans }))} tone="bg-amber-500" />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle eyebrow={t('branches')} title={t('activitySplit')} />
          <div className="mt-5 space-y-3">
            {branchBars.length > 0 ? (
              branchBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-stone-600">
                    <span>{bar.label}</span>
                    <span>{bar.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(8, (bar.value / maxBranch) * 100)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-stone-50 p-4 text-sm text-muted-foreground">{t('noAnalyticsData')}</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow={t('actions')} title={t('contactIntent')} />
          <div className="mt-5 space-y-3">
            {[
              { label: t('whatsappMetric'), value: metrics?.whatsapp.current ?? 0, tone: 'bg-emerald-500' },
              { label: t('calls'), value: metrics?.calls.current ?? 0, tone: 'bg-stone-800' },
              { label: t('maps'), value: metrics?.maps.current ?? 0, tone: 'bg-indigo-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-stone-600">
                  <span>{item.label}</span>
                  <span>{Math.round((item.value / actionTotal) * 100)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                  <div className={cx('h-full rounded-full transition-all', item.tone)} style={{ width: `${Math.max(5, (item.value / actionTotal) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle eyebrow={t('items')} title={t('topContent')} />
          <div className="mt-4 space-y-3">
            {topItems.map((item, index) => (
              <div key={item.itemId} className="flex items-center gap-3">
                <span className="w-4 text-center text-xs font-black text-muted-foreground">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-bold text-stone-800">{textForLocale(item.name, locale)}</span>
                    <span className="text-xs text-muted-foreground">{item.views.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.max(18, 92 - index * 14)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {topItems.length === 0 ? <p className="rounded-xl bg-stone-50 p-4 text-sm text-muted-foreground">{t('noMenuItemsToRank')}</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
