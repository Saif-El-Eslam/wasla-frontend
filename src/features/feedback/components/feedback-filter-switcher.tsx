'use client';

import { Archive, MessageSquareHeart, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cx } from '@/components/ui/dashboard-ui';

export type FeedbackFilter = 'issues' | 'all' | 'archived';

export function FeedbackFilterSwitcher({
  value,
  onChange,
}: {
  value: FeedbackFilter;
  onChange: (value: FeedbackFilter) => void;
}) {
  const t = useTranslations('dashboard');
  const options: Array<{
    value: FeedbackFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { value: 'issues', label: t('issues'), icon: TriangleAlert },
    { value: 'all', label: t('all'), icon: MessageSquareHeart },
    { value: 'archived', label: t('archivedFeedback'), icon: Archive },
  ];

  return (
    <div className="grid w-full grid-cols-3 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:w-auto sm:inline-grid">
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cx(
              'inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-black transition sm:gap-2 sm:px-3 sm:text-sm',
              active
                ? 'bg-white text-stone-950 shadow-sm ring-1 ring-stone-200'
                : 'text-muted-foreground hover:text-stone-800',
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
          >
            <Icon
              className={cx(
                'size-4 shrink-0',
                option.value === 'issues' && active ? 'text-rose-500' : '',
                option.value === 'archived' && active ? 'text-stone-500' : '',
              )}
            />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
