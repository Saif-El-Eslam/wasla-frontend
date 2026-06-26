'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ImagePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, type ExtractedMenu, type Menu } from '@/lib/api';
import { Badge, Card, SecondaryButton, SectionTitle, TabLoader } from '@/components/ui/dashboard-ui';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { replaceCachedMenu } from '@/features/menu/cache/menu-cache';
import { useExtractionJob, useLatestExtractionJob } from '@/features/venue/hooks/use-venue';
import { queryKeys } from '@/lib/api/query-keys';
import { textForLocale } from '@/lib/localized-text';
import { MenuExtractionDraftForm } from './menu-extraction-draft-form';

type Props = {
  branchId: string;
  menu: Menu | null;
  locale: string;
};

function cloneExtractedMenu(value: ExtractedMenu) {
  return JSON.parse(JSON.stringify(value)) as ExtractedMenu;
}

function statusTone(status?: string) {
  if (status === 'COMPLETED' || status === 'APPROVED') {
    return 'green' as const;
  }

  if (status === 'FAILED' || status === 'REJECTED') {
    return 'red' as const;
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return 'amber' as const;
  }

  return 'muted' as const;
}

export function MenuExtractionPanel({ branchId, menu, locale }: Props) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const latestJob = useLatestExtractionJob(branchId);
  const activeJob = useExtractionJob(branchId, activeJobId);
  const data = activeJobId ? activeJob.data : latestJob.data;
  const job = data?.job ?? null;
  const limits = data?.limits ?? latestJob.data?.limits;
  const [draftState, setDraftState] = useState<{ jobId: string; value: ExtractedMenu } | null>(null);
  const draft = useMemo(() => {
    if (!job) {
      return null;
    }

    if (draftState?.jobId === job.id) {
      return draftState.value;
    }

    return job.extractedMenu ? cloneExtractedMenu(job.extractedMenu) : null;
  }, [draftState, job]);

  const canUpload = files.length > 0 && (!limits || files.length <= limits.maxImages);
  const isBusy = job?.status === 'PENDING' || job?.status === 'PROCESSING';
  const itemCount = useMemo(
    () => draft?.categories.reduce((sum, category) => sum + category.items.length, 0) ?? 0,
    [draft],
  );

  const startMutation = useMutation({
    mutationFn: () => api.startExtraction(branchId, files),
    onSuccess: ({ job: startedJob, menu: returnedMenu }) => {
      setActiveJobId(startedJob.id);
      replaceCachedMenu(queryClient, branchId, returnedMenu);
      queryClient.invalidateQueries({ queryKey: queryKeys.branchMenu(branchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction(branchId, 'latest') });
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => {
      if (!job) {
        throw new Error('No extraction job selected');
      }

      return api.retryExtraction(branchId, job.id, files);
    },
    onSuccess: ({ job: retriedJob, menu: returnedMenu }) => {
      setActiveJobId(retriedJob.id);
      replaceCachedMenu(queryClient, branchId, returnedMenu);
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction(branchId, 'latest') });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!job) {
        throw new Error('No extraction job selected');
      }

      return api.approveExtraction(branchId, job.id, draft ?? undefined);
    },
    onSuccess: ({ menu: updatedMenu }) => {
      replaceCachedMenu(queryClient, branchId, updatedMenu);
      queryClient.invalidateQueries({ queryKey: queryKeys.branchMenu(branchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction(branchId, 'latest') });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!job) {
        throw new Error('No extraction job selected');
      }

      return api.rejectExtraction(branchId, job.id);
    },
    onSuccess: (result) => {
      setDraftState(null);
      if (result.job) {
        queryClient.setQueryData([...queryKeys.extraction(branchId, 'latest'), locale], result);
        queryClient.setQueryData(
          [...queryKeys.extraction(branchId, 'current', result.job.id), locale],
          result,
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction(branchId, 'latest') });
      queryClient.invalidateQueries({ queryKey: queryKeys.extraction(branchId, 'current', result.job?.id) });
    },
  });

  const updateDraft = (updater: (current: ExtractedMenu) => ExtractedMenu) => {
    if (!job || !draft) {
      return;
    }

    setDraftState({ jobId: job.id, value: updater(draft) });
  };

  const updateMenuName = (lang: 'en' | 'ar', value: string) => {
    updateDraft((current) => ({
      ...current,
      menu: { ...current.menu, name: { ...current.menu.name, [lang]: value } },
    }));
  };

  const updateCategory = (index: number, lang: 'en' | 'ar', value: string) => {
    updateDraft((current) => {
      const categories = [...current.categories];
      categories[index] = {
        ...categories[index],
        name: { ...categories[index].name, [lang]: value },
      };

      return { ...current, categories };
    });
  };

  const updateItem = (
    categoryIndex: number,
    itemIndex: number,
    field: 'name' | 'description',
    lang: 'en' | 'ar',
    value: string,
  ) => {
    updateDraft((current) => {
      const categories = [...current.categories];
      const category = categories[categoryIndex];
      const items = [...category.items];
      const item = items[itemIndex];
      items[itemIndex] = {
        ...item,
        [field]: {
          ...(item[field] ?? {}),
          [lang]: value,
        },
      };
      categories[categoryIndex] = { ...category, items };

      return { ...current, categories };
    });
  };

  const updateItemPrice = (categoryIndex: number, itemIndex: number, value: string) => {
    updateDraft((current) => {
      const categories = [...current.categories];
      const category = categories[categoryIndex];
      const items = [...category.items];
      const item = items[itemIndex];
      const numericValue = Number(value);
      const price = Number.isFinite(numericValue) ? numericValue : 0;
      items[itemIndex] = item.prices?.length
        ? { ...item, prices: item.prices.map((row, index) => (index === 0 ? { ...row, price } : row)) }
        : { ...item, price };
      categories[categoryIndex] = { ...category, items };

      return { ...current, categories };
    });
  };

  const selectedFileLabel =
    files.length > 0 ? t('selectedImages', { count: files.length }) : t('noImagesSelected');

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 flex-row items-start justify-between align-center">
          <SectionTitle
            icon={<Sparkles className="size-8 text-accent/100 p-2 bg-accent/9 rounded-full" />}
            title={t('menuExtraction')}
          >
            {job ? <Badge tone={statusTone(job.status)}>{t(`extractionStatus.${job.status}`)}</Badge> : null}
          </SectionTitle>

          <div className="text-xs font-bold uppercase tracking-normal text-primary">{t('AIEyebrow')}</div>
        </div>

        {limits ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t('extractionLimitSummary', {
                  remaining: limits.remainingThisMonth,
                  total: limits.monthlyExtractions,
                  images: limits.maxImages,
                })}
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((limits.monthlyExtractions - (limits.remainingThisMonth ?? 0)) / limits.monthlyExtractions) * 100))}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[1fr] items-end sm:items-center">
          <div>
            <div className="relative border-2 border-dashed border-stone-200 rounded-3xl p-4 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-colors cursor-pointer group">
              <ImagePlus
                size={20}
                className="mx-auto text-stone-300 group-hover:text-teal-400 transition-colors mb-2"
              />
              <div className="text-xs font-semibold text-stone-500 group-hover:text-teal-600 transition-colors">
                {selectedFileLabel}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP</div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row items-center justify-center">
            <SecondaryButton
              onClick={() => startMutation.mutate()}
              disabled={!canUpload || startMutation.isPending || isBusy}
              className="w-full bg-foreground rounded-3xl inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-bold text-primary-foreground shadow-md shadow-black-200 transition hover:brightness-95 disabled:opacity-55 hover:bg-foreground/90 disabled:bg-foreground/50 disabled:text-primary-foreground/50"
            >
              <Sparkles className="size-4" />
              {menu ? t('extractAndMerge') : t('extractAndCreate')}
            </SecondaryButton>
            {/* {job?.status === 'FAILED' || job?.status === 'REJECTED' ? (
              <PrimaryButton
                onClick={() => retryMutation.mutate()}
                disabled={!canUpload || retryMutation.isPending}
              >
                <RefreshCw className="size-4" />
                {t('retryExtraction')}
              </PrimaryButton>
            ) : null} */}
          </div>
        </div>

        {limits && files.length > limits.maxImages ? (
          <p className="text-xs font-bold text-red-700">
            {t('tooManyExtractionImages', { count: limits.maxImages })}
          </p>
        ) : null}
        {startMutation.error ? (
          <p className="text-xs text-red-700">{readError(startMutation.error)}</p>
        ) : null}
        {retryMutation.error ? (
          <p className="text-xs text-red-700">{readError(retryMutation.error)}</p>
        ) : null}

        {isBusy ? <TabLoader label={t('extractingMenu')} /> : null}

        {job?.errors.length ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {job.errors.join(' ')}
          </div>
        ) : null}

        {draft && job?.status === 'COMPLETED' ? (
          <MenuExtractionDraftForm
            draft={draft}
            itemCount={itemCount}
            confidenceScore={job.confidenceScore}
            onUpdateMenuName={updateMenuName}
            onUpdateCategory={updateCategory}
            onUpdateItem={updateItem}
            onUpdateItemPrice={updateItemPrice}
            onApprove={() => approveMutation.mutate()}
            onReject={() => rejectMutation.mutate()}
            approvePending={approveMutation.isPending}
            rejectPending={rejectMutation.isPending}
            approveError={approveMutation.error}
            rejectError={rejectMutation.error}
          />
        ) : null}

        {job?.status === 'APPROVED' ? (
          <div className="flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <Sparkles className="size-4" />
            {t('extractionApprovedFor', { menu: textForLocale(menu?.name, locale) || commonT('wasla') })}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
