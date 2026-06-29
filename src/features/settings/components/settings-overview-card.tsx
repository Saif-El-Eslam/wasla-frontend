'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/dashboard-ui';
import type { CurrentUser, Venue } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';

export function SettingsOverviewCard({
  me,
  venue,
  locale,
  isAdmin,
  userCount,
}: {
  me?: CurrentUser;
  venue?: Venue;
  locale: string;
  isAdmin: boolean;
  userCount: number;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');

  return (
    <div className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/70 to-amber-50/70 p-4 shadow-glass">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary text-xl font-black text-white shadow-lg shadow-teal-200">
            {(me?.name || me?.phone || 'W').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-stone-950">{me?.name || me?.phone}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-muted-foreground">
              <span>{me?.phone}</span>
              <Badge tone={me?.verified ? 'green' : 'amber'}>
                {me?.verified ? t('accountVerified') : commonT('notSet')}
              </Badge>
              <Badge tone="teal">{me?.role ?? ''}</Badge>
            </p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[360px]">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-normal text-teal-700">{t('venue')}</p>
            <p className="mt-1 truncate text-sm font-black text-stone-950">
              {textForLocale(venue?.name, locale) || commonT('notSet')}
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-normal text-teal-700">{t('team')}</p>
            <p className="mt-1 text-sm font-black text-stone-950">
              {isAdmin ? `${userCount || '-'} ${t('members')}` : t('role', { role: me?.role ?? '' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
