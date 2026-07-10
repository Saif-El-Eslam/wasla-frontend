'use client';

import { ExternalLink, Star, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/dashboard-ui';
import type { FeedbackDashboardResponse } from '@/lib/api';

type FeedbackSummary = FeedbackDashboardResponse['summary'];

function formatRating(value: number) {
  return value ? value.toFixed(1) : '0.0';
}

export function FeedbackSummaryGrid({ summary }: { summary?: FeedbackSummary }) {
  const t = useTranslations('dashboard');

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="border-amber-100 bg-amber-50/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-700">{t('averageRating')}</p>
            <p className="mt-2 text-3xl font-black text-stone-950">
              {formatRating(summary?.averageRating ?? 0)}
            </p>
          </div>
          <Star className="size-8 fill-amber-400 text-amber-400" />
        </div>
      </Card>
      <Card className="border-rose-100 bg-rose-50/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-700">{t('issues')}</p>
            <p className="mt-2 text-3xl font-black text-stone-950">{summary?.privateIssues ?? 0}</p>
          </div>
          <TriangleAlert className="size-8 text-rose-500" />
        </div>
      </Card>
      <Card className="border-teal-100 bg-teal-50/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-teal-700">
              {t('googleRedirects')}
            </p>
            <p className="mt-2 text-3xl font-black text-stone-950">{summary?.redirectCount ?? 0}</p>
          </div>
          <ExternalLink className="size-8 text-teal-600" />
        </div>
      </Card>
    </div>
  );
}
