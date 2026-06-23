'use client';

import { ChevronDown } from 'lucide-react';
import type { BranchOption } from '@/api';
import { textForLocale } from '@/lib/localized-text';

export function BranchSelect({
  branches,
  value,
  onChange,
  locale = 'en',
  includeAll = false,
  allLabel,
}: {
  branches: BranchOption[];
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  includeAll?: boolean;
  allLabel?: string;
}) {
  return (
    <label className="relative block min-w-0">
      <select
        className="h-11 w-full min-w-[210px] appearance-none rounded-xl border border-border bg-white px-3 pe-9 text-sm font-semibold text-stone-800 shadow-sm outline-none transition focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {includeAll ? <option value="all">{allLabel}</option> : null}
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {textForLocale(branch.name, locale) || branch.slug}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
    </label>
  );
}
