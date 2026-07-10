'use client';

import { CheckCircle2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, cx } from '@/components/ui/dashboard-ui';
import type { GuestFeedback, GuestFeedbackStatus } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';

function statusTone(status: GuestFeedbackStatus) {
  return status === 'NEW' ? 'amber' : status === 'REVIEWED' ? 'green' : 'muted';
}

export function FeedbackCard({
  item,
  locale,
  onStatusChange,
  pending,
}: {
  item: GuestFeedback;
  locale: string;
  onStatusChange: (status: GuestFeedbackStatus) => void;
  pending: boolean;
}) {
  const t = useTranslations('dashboard');
  const branchName = textForLocale(item.branch.name, locale) || item.branch.slug;

  return (
    <Card
      className={cx('border-stone-200 bg-white p-4', item.rating <= 3 && 'border-amber-200 bg-amber-50/30')}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={cx('size-4', index < item.rating ? 'fill-current' : 'text-stone-300')}
                />
              ))}
            </div>
            <Badge tone={statusTone(item.status)}>{t(`feedbackStatus_${item.status}`)}</Badge>
            {item.rating <= 3 ? <Badge tone="amber">{t('privateIssue')}</Badge> : null}
            {item.googleReviewClickedAt ? <Badge tone="teal">{t('googleRedirected')}</Badge> : null}
          </div>
          <p className="mt-2 text-sm font-black text-stone-950">{branchName}</p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">
            {new Date(item.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        </div>
        <div className="flex gap-2">
          {item.status !== 'REVIEWED' ? (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-black text-emerald-700 disabled:opacity-50"
              onClick={() => onStatusChange('REVIEWED')}
              disabled={pending}
            >
              <CheckCircle2 className="size-4" />
              {t('markReviewed')}
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-white/80 p-3 text-sm font-semibold leading-6 text-stone-700">
        {item.comment || t('noFeedbackComment')}
      </p>
    </Card>
  );
}
