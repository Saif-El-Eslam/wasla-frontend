'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, GitBranch, Sparkles } from 'lucide-react';
import type { BranchOption } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';
import { cx } from './cx';

type BranchSelectOption =
  | BranchOption
  | { id: 'all'; name: string; slug: 'all'; active: true; isMain: false };

export function BranchSelect({
  branches,
  value,
  onChange,
  locale = 'en',
  includeAll = false,
  allLabel = 'All branches',
}: {
  branches: BranchOption[];
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  includeAll?: boolean;
  allLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const options: BranchSelectOption[] = includeAll
    ? [{ id: 'all', name: allLabel, slug: 'all', active: true, isMain: false }, ...branches]
    : branches;
  const selectedOption = options.find((branch) => branch.id === value) ?? options[0];
  const selectedLabel =
    selectedOption?.id === 'all'
      ? allLabel
      : textForLocale(selectedOption?.name, locale) || selectedOption?.slug || allLabel;

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0 sm:w-auto">
      <button
        type="button"
        className={cx(
          'group flex h-12 w-full min-w-0 items-center gap-3 rounded-3xl border border-teal-100 bg-white/95 ps-1.5 pe-3 text-start shadow-sm shadow-teal-50 outline-none ring-1 ring-transparent backdrop-blur transition sm:min-w-[230px]',
          'hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md focus:border-primary focus:ring-primary/15',
          open && 'border-primary ring-primary/15',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-200 transition group-active:scale-95">
          {selectedOption?.isMain ? <Sparkles className="size-4" /> : <GitBranch className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black text-stone-950">{selectedLabel}</span>
          {selectedOption && selectedOption.id !== 'all' ? (
            <span className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <span
                className={cx(
                  'size-1.5 rounded-full',
                  selectedOption.active ? 'bg-emerald-500' : 'bg-stone-300',
                )}
              />
              {selectedOption.slug}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cx('size-4 shrink-0 text-teal-700 transition duration-200', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          className="absolute end-0 z-999 mt-2 max-h-72 w-full min-w-0 overflow-y-auto rounded-3xl border border-teal-100 bg-white p-1.5 shadow-2xl shadow-stone-200/70 sm:min-w-[260px]"
          role="listbox"
        >
          {options.map((branch) => {
            const isAll = branch.id === 'all';
            const isSelected = branch.id === value;
            const label = isAll ? allLabel : textForLocale(branch.name, locale) || branch.slug;

            return (
              <button
                key={branch.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cx(
                  'flex min-h-12 w-full items-center gap-3 rounded-3xl px-2.5 py-2 text-start transition',
                  isSelected
                    ? 'bg-teal-50 text-teal-900'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950',
                )}
                onClick={() => selectOption(branch.id)}
              >
                <span
                  className={cx(
                    'flex size-8 shrink-0 items-center justify-center rounded-3xl',
                    isSelected ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500',
                  )}
                >
                  {branch.isMain ? <Sparkles className="size-4" /> : <GitBranch className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{label}</span>
                  {!isAll ? (
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <span
                        className={cx(
                          'size-1.5 rounded-full',
                          branch.active ? 'bg-emerald-500' : 'bg-stone-300',
                        )}
                      />
                      {branch.slug}
                    </span>
                  ) : null}
                </span>
                {isSelected ? <Check className="size-4 shrink-0 text-teal-700" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
