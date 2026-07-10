'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from './cx';

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function PaginationControls({
  pagination,
  onPageChange,
  summary,
  previousLabel,
  nextLabel,
  pageLabel = 'Page',
  className,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  summary: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel?: string;
  className?: string;
}) {
  const listId = useId();
  const [draftPage, setDraftPage] = useState(String(pagination.page));
  const pageOptions = useMemo(
    () => Array.from({ length: Math.min(pagination.totalPages, 500) }, (_, index) => index + 1),
    [pagination.totalPages],
  );

  useEffect(() => {
    setDraftPage(String(pagination.page));
  }, [pagination.page]);

  // if (pagination.totalPages <= 1) {
  //   return null;
  // }

  const commitPage = () => {
    const parsed = Number.parseInt(draftPage, 10);

    if (Number.isNaN(parsed)) {
      setDraftPage(String(pagination.page));
      return;
    }

    const nextPage = clampPage(parsed, pagination.totalPages);
    setDraftPage(String(nextPage));

    if (nextPage !== pagination.page) {
      onPageChange(nextPage);
    }
  };

  return (
    <nav
      className={cx('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
      aria-label={summary}
    >
      <p className="text-sm font-bold text-muted-foreground">{summary}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(clampPage(pagination.page - 1, pagination.totalPages))}
          disabled={!pagination.hasPreviousPage}
          aria-label={previousLabel}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </button>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-black text-stone-700">
          <span className="text-muted-foreground">{pageLabel}</span>
          <input
            className="h-8 w-16 rounded-lg bg-stone-50 px-2 text-center font-black text-stone-950 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20"
            inputMode="numeric"
            type="number"
            min={1}
            max={pagination.totalPages}
            list={listId}
            value={draftPage}
            onChange={(event) => setDraftPage(event.target.value)}
            onBlur={commitPage}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
            aria-label={pageLabel}
          />
          <span className="text-muted-foreground">/ {pagination.totalPages}</span>
        </label>
        <datalist id={listId}>
          {pageOptions.map((page) => (
            <option key={page} value={page} />
          ))}
        </datalist>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(clampPage(pagination.page + 1, pagination.totalPages))}
          disabled={!pagination.hasNextPage}
          aria-label={nextLabel}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </nav>
  );
}
