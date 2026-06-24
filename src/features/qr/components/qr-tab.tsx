'use client';

import {
  ArrowUpRight,
  Building2,
  Download,
  LinkIcon,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Badge,
  BranchSelect,
  Card,
  EmptyState,
  IconButton,
  QRMock,
  SectionTitle,
  TabLoader,
  cx,
} from '@/components/ui/dashboard-ui';
import { useBranchOptions, useBranchQr } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

export function QrTab({
  initialBranchId,
  locale,
}: {
  initialBranchId: string;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const selectedBranchId = branches.some((item) => item.id === initialBranchId) ? initialBranchId : defaultBranchId;
  const [localBranchId, setLocalBranchId] = useState('');
  const effectiveBranchId = branches.some((item) => item.id === localBranchId) ? localBranchId : selectedBranchId;
  const qrQuery = useBranchQr(effectiveBranchId);
  const branch = qrQuery.data?.branch;
  const menu = qrQuery.data?.menu ?? null;

  useEffect(() => {
    if (initialBranchId) {
      setLocalBranchId(initialBranchId);
    }
  }, [initialBranchId]);

  if (branchOptions.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (branches.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title={t('createBranchFirst')}
        body={t('menuNeedsBranch')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('branchQr')} title={t('qrHub')}>
        <BranchSelect branches={branches} value={effectiveBranchId} onChange={setLocalBranchId} locale={locale} />
      </SectionTitle>
      {qrQuery.isLoading ? (
        <TabLoader label={t('loadingWorkspace')} />
      ) : !menu ? (
        <EmptyState
          icon={QrCode}
          title={t('qrNeedsMenu')}
          body={t('qrNeedsMenuBody')}
        />
      ) : (
        <div className="grid gap-4 xl:grid-rows">
          <Card className="grid place-items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-xl shadow-teal-100">
              <QRMock />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs font-bold uppercase tracking-normal text-primary">{t('scanToOpenMenu')}</p>
              <h3 className="mt-1 text-lg font-black text-stone-950">
                {textForLocale(branch?.name, locale)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {menu.qrCode?.shortCode ?? t('pendingShortCode')}
              </p>
            </div>
          </Card>
          <Card className="flex flex-col justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone={menu.publishedAt ? 'green' : 'amber'}>
                  {menu.publishedAt ? t('published') : t('draftMenu')}
                </Badge>
                <h3 className="mt-3 text-2xl font-black text-stone-950">
                  {textForLocale(branch?.name, locale)}
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  {t('qrDescription')}
                </p>
              </div>
              <div className="flex gap-2">
                <IconButton label={t('downloadQr')}>
                  <Download className="size-4" />
                </IconButton>
                <IconButton label={t('copyLink')}>
                  <LinkIcon className="size-4" />
                </IconButton>
                <IconButton label={t('shareQr')}>
                  <Share2 className="size-4" />
                </IconButton>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: t('qrScans'),
                  value: menu.analytics?.qrScanCount ?? 0,
                  tone: 'bg-teal-50 text-teal-700',
                  icon: QrCode,
                },
                {
                  label: t('views'),
                  value: menu.analytics?.viewCount ?? 0,
                  tone: 'bg-stone-50 text-stone-900',
                  icon: ArrowUpRight,
                },
                {
                  label: t('whatsappMetric'),
                  value: menu.analytics?.whatsappClicks ?? 0,
                  tone: 'bg-amber-50 text-amber-700',
                  icon: MessageCircle,
                },
              ].map((metric) => {
                const Icon = metric.icon;

                return (
                  <div key={metric.label} className={cx('rounded-2xl p-4', metric.tone)}>
                    <Icon className="size-4" />
                    <p className="mt-2 text-2xl font-black">{metric.value.toLocaleString()}</p>
                    <p className="text-xs font-semibold">{metric.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-stone-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-stone-500">
                  <Phone className="size-4" />
                  {t('branchPhone')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-stone-900">
                  {branch?.phone ?? t('notConfigured')}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-stone-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-stone-500">
                  <LinkIcon className="size-4" />
                  {t('publicUrl')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-stone-900">
                  {menu.qrCode?.targetUrl ?? `/m/${menu.qrCode?.shortCode ?? t('pending')}`}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
