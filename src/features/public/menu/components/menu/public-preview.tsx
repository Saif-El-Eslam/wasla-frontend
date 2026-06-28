'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PublicBranchSwitcher } from '../branch/public-branch-switcher';
import { PublicMenuExperience } from './public-menu-experience';
import { useBranchManagement, useBranchMenu } from '@/features/venue/hooks/use-venue';
import { textForLocale } from '@/lib/localized-text';

export function PublicPreview({
  venueName,
  branchId,
  locale,
  currency,
}: {
  venueName?: string;
  branchId: string;
  locale: string;
  currency: string;
  onClose?: () => void;
}) {
  const t = useTranslations('dashboard');
  const branchManagement = useBranchManagement();
  const branches = branchManagement.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const [selectedBranchId, setSelectedBranchId] = useState(branchId);
  const effectiveBranchId = branches.some((item) => item.id === selectedBranchId)
    ? selectedBranchId
    : defaultBranchId;
  const menuQuery = useBranchMenu(effectiveBranchId);
  const branch = branches.find((item) => item.id === effectiveBranchId);
  const menu = menuQuery.data;

  useEffect(() => {
    setSelectedBranchId(branchId);
  }, [branchId]);

  return (
    <div>
      {branchManagement.isLoading || menuQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-white p-6 text-center text-sm font-bold text-muted-foreground">
          {t('loadingWorkspace')}
        </div>
      ) : (
        <PublicMenuExperience
          venue={{
            id: branch?.venueId ?? 'preview',
            ownerId: null,
            type: 'RESTAURANT',
            name: venueName || textForLocale(branch?.name, locale) || t('waslaVenue'),
            slug: 'preview',
            description: null,
            defaultLocale: locale,
            supportedLocales: ['ar', 'en'],
            timezone: 'Africa/Cairo',
            currency,
            phone: branch?.phone ?? null,
            whatsapp: branch?.whatsapp ?? null,
            address: branch?.address ?? null,
            branches,
          }}
          branch={branch}
          branches={branches}
          menu={menu ?? null}
          locale={locale}
          currency={currency}
          toolbar={
            <div className="flex items-center gap-2">
              <PublicBranchSwitcher
                branches={branches}
                value={effectiveBranchId}
                locale={locale}
                onChange={setSelectedBranchId}
              />
            </div>
          }
        />
      )}
    </div>
  );
}
