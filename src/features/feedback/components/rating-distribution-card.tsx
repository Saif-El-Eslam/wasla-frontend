'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/dashboard-ui';
import type { FeedbackDashboardResponse } from '@/lib/api';
import { FeedbackFilterSwitcher, type FeedbackFilter } from './feedback-filter-switcher';

type FeedbackSummary = FeedbackDashboardResponse['summary'];

export function RatingDistributionCard({
  summary,
  filter,
  onFilterChange,
}: {
  summary?: FeedbackSummary;
  filter: FeedbackFilter;
  onFilterChange: (filter: FeedbackFilter) => void;
}) {
  const t = useTranslations('dashboard');
  const buckets = summary?.ratingBuckets ?? [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 }));

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-stone-950">{t('ratingDistribution')}</h3>
          <p className="text-sm font-semibold text-muted-foreground">{t('feedbackBody')}</p>
        </div>
        <FeedbackFilterSwitcher value={filter} onChange={onFilterChange} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {buckets.map((bucket) => (
          <div key={bucket.rating} className="rounded-2xl bg-stone-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-stone-800">{bucket.rating}</span>
              <Star className="size-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{
                  width: `${summary?.total ? Math.round((bucket.count / summary.total) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-muted-foreground">{bucket.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
