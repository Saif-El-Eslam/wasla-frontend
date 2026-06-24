'use client';

import { ChevronDown, Store } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BranchManagement } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';
import { textForLocale } from '@/lib/localized-text';

export function PublicBranchSwitcher({
  branches,
  value,
  locale,
  onChange,
}: {
  branches: BranchManagement[];
  value: string;
  locale: string;
  onChange: (branchId: string) => void;
}) {
  const t = useTranslations('dashboard');
  const [open, setOpen] = useState(false);
  const selected = branches.find((branch) => branch.id === value);

  if (branches.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-[#042f2e] px-3 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-[#042f2e]/80"
        onClick={() => setOpen((current) => !current)}
      >
        <Store className="size-4 text-teal-200" />
        <span className="max-w-36 truncate">
          {selected ? textForLocale(selected.name, locale) : t('branches')}
        </span>
        <ChevronDown className={cx('size-4 transition', open ? 'rotate-180' : '')} />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-2xl border border-border bg-white p-2 text-start shadow-2xl">
          {branches.map((branch) => (
            <button
              key={branch.id}
              className={cx(
                'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition',
                branch.id === value ? 'bg-teal-50 text-primary' : 'text-stone-700 hover:bg-stone-50',
              )}
              onClick={() => {
                onChange(branch.id);
                setOpen(false);
              }}
            >
              <span
                className={cx('size-2 rounded-full', branch.active ? 'bg-emerald-400' : 'bg-stone-300')}
              />
              <span className="min-w-0 flex-1 truncate">{textForLocale(branch.name, locale)}</span>
              {branch.isMain ? <span className="text-xs text-teal-600">{t('main')}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
