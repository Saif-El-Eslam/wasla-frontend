'use client';

import {
  ArrowUpRight,
  Building2,
  Check,
  Download,
  FileImage,
  LinkIcon,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Badge,
  BranchSelect,
  Card,
  EmptyState,
  IconButton,
  QueryErrorState,
  SectionTitle,
  TabLoader,
  cx,
} from '@/components/ui/dashboard-ui';
import { AppImage } from '@/components/ui/app-image';
import { useBranchOptions, useBranchQr } from '@/features/venue/hooks/use-venue';
import { axiosClient } from '@/lib/api/axios';
import { toast } from '@/components/ui/toast-store';
import { textForLocale } from '@/lib/localized-text';

async function loadAssetBlob(path: string | undefined) {
  if (!path) {
    return null;
  }

  const response = await axiosClient.request<Blob>({
    url: path,
    method: 'GET',
    responseType: 'blob',
  });

  return response.data;
}

async function downloadAsset(path: string | undefined, filename: string) {
  if (!path || typeof window === 'undefined') {
    return false;
  }

  const blob = await loadAssetBlob(path);

  if (!blob) {
    return false;
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);

  return true;
}

async function fetchAssetFile(path: string | undefined, filename: string, fallbackType: string) {
  if (!path || typeof window === 'undefined') {
    return null;
  }

  const blob = await loadAssetBlob(path);

  if (!blob) {
    return null;
  }

  return new File([blob], filename, { type: blob.type || fallbackType });
}

export function QrTab({ initialBranchId, locale }: { initialBranchId: string; locale: string }) {
  const t = useTranslations('dashboard');
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const selectedBranchId = branches.some((item) => item.id === initialBranchId)
    ? initialBranchId
    : defaultBranchId;
  const [localBranchId, setLocalBranchId] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const effectiveBranchId = branches.some((item) => item.id === localBranchId)
    ? localBranchId
    : selectedBranchId;
  const qrQuery = useBranchQr(effectiveBranchId);
  const branch = qrQuery.data?.branch;
  const menu = qrQuery.data?.menu ?? null;
  const publicUrl = qrQuery.data?.publicMenuUrl ?? menu?.qrCode?.shortUrl ?? menu?.qrCode?.targetUrl ?? '';
  const shortUrl = menu?.qrCode?.shortUrl ?? menu?.qrCode?.targetUrl ?? publicUrl;
  const branchName = textForLocale(branch?.name, locale);
  const venueName = textForLocale(qrQuery.data?.venue?.name, locale);
  const assetBaseName = `wasla-${branch?.slug ?? 'menu'}-qr`;
  const assetVersion = encodeURIComponent(qrQuery.data?.generatedAt ?? '');
  const assetQuery = assetVersion ? `?v=${assetVersion}` : '';
  const pngPath = effectiveBranchId ? `/branches/${effectiveBranchId}/qr.png${assetQuery}` : undefined;
  const svgPath = effectiveBranchId ? `/branches/${effectiveBranchId}/qr.svg${assetQuery}` : undefined;
  const posterPath = effectiveBranchId
    ? `/branches/${effectiveBranchId}/qr/poster.png${assetQuery}`
    : undefined;

  const runAssetAction = async (action: () => Promise<boolean | void>, successTitle?: string) => {
    try {
      setDownloadError('');
      const completed = await action();

      if (completed !== false && successTitle) {
        toast.success(successTitle);
      }
    } catch {
      setDownloadError(t('qrDownloadFailed'));
      toast.error(t('qrDownloadFailed'));
    }
  };

  const copyLink = async () => {
    if (!shortUrl || typeof navigator === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success(t('qrLinkCopied'));
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t('qrCopyFailed'));
    }
  };

  const shareQr = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const filename = `${assetBaseName}.png`;
    const file = await fetchAssetFile(pngPath, filename, 'image/png');

    if (!file) {
      return false;
    }

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: branchName,
          files: [file],
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false;
        }

        throw error;
      }

      return true;
    }

    return downloadAsset(pngPath, filename);
  };

  if (branchOptions.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (branchOptions.isError) {
    return <QueryErrorState onRetry={() => void branchOptions.refetch()} />;
  }

  if (branches.length === 0) {
    return <EmptyState icon={Building2} title={t('createBranchFirst')} body={t('menuNeedsBranch')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('branchQr')} title={t('qrHub')}>
        <BranchSelect
          branches={branches}
          value={effectiveBranchId}
          onChange={setLocalBranchId}
          locale={locale}
        />
      </SectionTitle>
      {qrQuery.isLoading ? (
        <TabLoader label={t('loadingWorkspace')} />
      ) : qrQuery.isError ? (
        <QueryErrorState onRetry={() => void qrQuery.refetch()} />
      ) : !menu ? (
        <EmptyState icon={QrCode} title={t('qrNeedsMenu')} body={t('qrNeedsMenuBody')} />
      ) : (
        <div className="grid min-w-0 gap-4">
          <Card className="grid min-w-0 place-items-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
            <div className="w-full max-w-[min(420px,calc(100vw-4rem))]">
              <div className="rounded-[1.25rem] border border-white bg-white p-2 shadow-xl shadow-teal-100 sm:rounded-[1.75rem] sm:p-3">
                {qrQuery.data?.previewDataUrl ? (
                  <div className="relative aspect-[24/29] max-h-[68dvh] w-full">
                    <AppImage
                      src={qrQuery.data.previewDataUrl}
                      alt={t('qrPreviewAlt')}
                      fill
                      sizes="420px"
                      className="rounded-2xl object-contain sm:rounded-[1.25rem]"
                    />
                  </div>
                ) : (
                  <div className="grid aspect-[24/29] max-h-[68dvh] w-full place-items-center rounded-2xl bg-stone-50 sm:rounded-[1.25rem]">
                    <QrCode className="size-16 text-teal-700" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                  <ShieldCheck className="size-3.5" />
                  {t('qrWatermarked')}
                </p>
                <h3 className="mt-2 text-lg font-black text-stone-950">{branchName}</h3>
                <p className="text-xs font-bold text-muted-foreground">{venueName || t('brandedByWasla')}</p>
              </div>
            </div>
          </Card>
          <Card className="flex min-w-0 flex-col justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Badge tone={menu.publishedAt ? 'green' : 'amber'}>
                  {menu.publishedAt ? t('published') : t('draftMenu')}
                </Badge>
                <h3 className="mt-3 break-words text-2xl font-black text-stone-950">{branchName}</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{t('qrDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <IconButton
                  label={t('downloadPng')}
                  onClick={() =>
                    void runAssetAction(
                      () => downloadAsset(pngPath, `${assetBaseName}.png`),
                      t('qrDownloadReady'),
                    )
                  }
                  disabled={!menu.qrCode}
                >
                  <Download className="size-4" />
                </IconButton>
                <IconButton
                  label={t('downloadSvg')}
                  onClick={() =>
                    void runAssetAction(
                      () => downloadAsset(svgPath, `${assetBaseName}.svg`),
                      t('qrDownloadReady'),
                    )
                  }
                  disabled={!menu.qrCode}
                >
                  <FileImage className="size-4" />
                </IconButton>
                <IconButton
                  label={copied ? t('qrCopied') : t('copyLink')}
                  onClick={() => void copyLink()}
                  disabled={!shortUrl}
                >
                  {copied ? <Check className="size-4" /> : <LinkIcon className="size-4" />}
                </IconButton>
                <IconButton
                  label={t('shareQr')}
                  onClick={() => void runAssetAction(shareQr, t('qrShareReady'))}
                  disabled={!menu.qrCode}
                >
                  <Share2 className="size-4" />
                </IconButton>
              </div>
            </div>
            {downloadError ? (
              <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {downloadError}
              </p>
            ) : null}
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
                  <div key={metric.label} className={cx('min-w-0 rounded-2xl p-4', metric.tone)}>
                    <Icon className="size-4" />
                    <p className="mt-2 text-2xl font-black">{metric.value.toLocaleString()}</p>
                    <p className="text-xs font-semibold">{metric.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="min-w-0 rounded-2xl border border-border bg-stone-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-stone-500">
                  <QrCode className="size-4" />
                  {t('qrShortLink')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-stone-900">
                  {menu.qrCode?.shortCode ?? t('pendingShortCode')}
                </p>
              </div>
              <div className="min-w-0 rounded-2xl border border-border bg-stone-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-stone-500">
                  <LinkIcon className="size-4" />
                  {t('publicUrl')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-stone-900">{publicUrl}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void runAssetAction(
                    () => downloadAsset(posterPath, `${assetBaseName}-poster.png`),
                    t('qrDownloadReady'),
                  )
                }
                disabled={!menu.qrCode}
                className="min-w-0 rounded-2xl border border-teal-100 bg-teal-50 p-3 text-start transition hover:border-teal-200 hover:bg-teal-100 disabled:opacity-50"
              >
                <p className="flex items-center gap-2 text-xs font-bold text-teal-700">
                  <FileImage className="size-4" />
                  {t('downloadPoster')}
                </p>
                <p className="mt-1 truncate text-sm font-black text-teal-900">{t('posterReady')}</p>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
