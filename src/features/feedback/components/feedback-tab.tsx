'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  BranchSelect,
  Card,
  EmptyState,
  PaginationControls,
  SectionTitle,
  TabLoader,
} from '@/components/ui/dashboard-ui';
import { api, type GuestFeedbackStatus } from '@/lib/api';
import { useBranchOptions } from '@/features/venue/hooks/use-venue';
import { useFeedbackDashboard } from '../hooks/use-feedback';
import { FeedbackCard } from './feedback-card';
import { FeedbackSummaryGrid } from './feedback-summary-grid';
import type { FeedbackFilter } from './feedback-filter-switcher';
import { RatingDistributionCard } from './rating-distribution-card';

const pageSize = 12;

export function FeedbackTab({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState('all');
  const [filter, setFilter] = useState<FeedbackFilter>('issues');
  const [page, setPage] = useState(1);
  const branchesQuery = useBranchOptions();
  const branches = branchesQuery.data?.branches ?? [];
  const issueOnly = filter === 'issues';
  const status: GuestFeedbackStatus | undefined = filter === 'archived' ? 'ARCHIVED' : undefined;
  const options = useMemo(
    () => ({
      branchId: branchId === 'all' ? undefined : branchId,
      issueOnly: issueOnly ? true : undefined,
      status,
      page,
      limit: pageSize,
    }),
    [branchId, issueOnly, status, page],
  );
  const feedback = useFeedbackDashboard(options);
  const summary = feedback.data?.summary;
  const items = feedback.data?.feedback ?? [];
  const pagination = feedback.data?.pagination;
  const updateStatus = useMutation({
    mutationFn: ({ feedbackId, status }: { feedbackId: string; status: GuestFeedbackStatus }) =>
      api.updateFeedbackStatus(feedbackId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feedback', 'dashboard'] });
    },
  });

  const changeBranch = (nextBranchId: string) => {
    setBranchId(nextBranchId);
    setPage(1);
  };

  const changeFilter = (nextFilter: FeedbackFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  if (branchesQuery.isLoading || feedback.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('feedbackEyebrow')} title={t('feedback')}>
        <BranchSelect
          branches={branches}
          value={branchId}
          onChange={changeBranch}
          includeAll
          allLabel={t('allBranches')}
          locale={locale}
        />
      </SectionTitle>

      <FeedbackSummaryGrid summary={summary} />
      <RatingDistributionCard summary={summary} filter={filter} onFilterChange={changeFilter} />

      {items.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              locale={locale}
              pending={updateStatus.isPending}
              onStatusChange={(status) => updateStatus.mutate({ feedbackId: item.id, status })}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Inbox} title={t('noFeedbackYet')} body={t('noFeedbackYetBody')} />
      )}

      {pagination ? (
        <Card className="p-3">
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            summary={t('paginationSummary', {
              page: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
            })}
            previousLabel={t('previous')}
            nextLabel={t('next')}
            pageLabel={t('page')}
          />
        </Card>
      ) : null}
    </div>
  );
}


