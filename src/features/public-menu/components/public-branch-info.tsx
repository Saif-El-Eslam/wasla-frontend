'use client';

import { Clock3, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BranchManagement } from '@/lib/api';
import { Badge } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';
import { PublicBranchActions } from './public-branch-actions';

function formatOpeningHours(branch?: BranchManagement) {
  const from = branch?.openingHours?.from;
  const to = branch?.openingHours?.to;

  if (from && to) {
    return `${from} - ${to}`;
  }

  return from || to || '';
}

export function PublicBranchInfo({
  venueName,
  branch,
  locale,
}: {
  venueName: string;
  branch?: BranchManagement;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const address = textForLocale(branch?.address, locale);
  const openingHours = formatOpeningHours(branch);

  return (
    <div className="space-y-5 text-center">
      <div>
        <h1 className="text-3xl font-black text-stone-950">{venueName || t('waslaVenue')}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge tone="teal">{branch ? textForLocale(branch.name, locale) : t('noBranch')}</Badge>
          <Badge tone={branch?.active ? 'green' : 'muted'}>
            {branch?.active ? t('openNow') : t('inactive')}
          </Badge>
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t('previewBody')}</p>
      </div>

      <div className="mx-auto grid max-w-xl gap-2 text-sm text-muted-foreground">
        {address && (
          <div className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2">
            <MapPin className="size-4 text-primary" />
            <span>{address}</span>
          </div>
        )}
        <PublicBranchActions branch={branch} />
        {openingHours && (
          <div className="mx-auto w-fit align-center inline-flex items-center justify-center gap-2 rounded-full bg-stone-100 px-3 py-2">
            <Clock3 className="size-4 text-primary" />
            <span>
              {t('openingHours')}: {openingHours}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
