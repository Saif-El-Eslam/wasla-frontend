'use client';

import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, SecondaryButton, TabLoader } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import {
  allowedDateRangeFromIso,
  clampDateRangeInputs,
  currentMonthStartDateInTimeZone,
  dateInputValueInTimeZone,
  endOfDateInputInTimeZone,
  rollingAllowedDaysRange,
  startOfDateInputInTimeZone,
} from '@/lib/date';
import { textForLocale } from '@/lib/localized-text';
import { useDeleteFinancialTransaction, useFinanceAccess, useInfiniteFinancialTransactions } from '../hooks/use-financial';
import { formatFinanceAmount } from '../utils/financial-format';

export function TransactionsPanel({
  currency,
  locale,
  timeZone,
}: {
  currency: string;
  locale: string;
  timeZone?: string;
}) {
  const t = useTranslations('dashboard');
  const access = useFinanceAccess();
  const allowedRange = allowedDateRangeFromIso(
    access.data?.allowance.allowedFrom,
    access.data?.allowance.allowedTo,
    timeZone,
  );
  const fallbackAllowedRange = access.data?.allowance.allTimeHistory
    ? { from: undefined, to: dateInputValueInTimeZone(new Date(), timeZone) }
    : rollingAllowedDaysRange(access.data?.allowance.historyDays ?? 7, timeZone);
  const effectiveAllowedRange = {
    from: allowedRange.from ?? fallbackAllowedRange.from,
    to: allowedRange.to ?? fallbackAllowedRange.to,
  };
  const [type, setType] = useState<'IN' | 'OUT' | ''>('');
  const [fromDate, setFromDate] = useState(() => currentMonthStartDateInTimeZone(timeZone));
  const [toDate, setToDate] = useState(() => dateInputValueInTimeZone(new Date(), timeZone));
  const [rangeWasClamped, setRangeWasClamped] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const effectiveDateRange = useMemo(
    () => clampDateRangeInputs(fromDate, toDate, effectiveAllowedRange.from, effectiveAllowedRange.to),
    [effectiveAllowedRange.from, effectiveAllowedRange.to, fromDate, toDate],
  );
  const filters = useMemo(
    () => ({
      type: type || undefined,
      from: startOfDateInputInTimeZone(effectiveDateRange.from, timeZone),
      to: endOfDateInputInTimeZone(effectiveDateRange.to, timeZone),
      limit: 10,
    }),
    [effectiveDateRange.from, effectiveDateRange.to, timeZone, type],
  );
  const transactions = useInfiniteFinancialTransactions(filters);
  const deleteMutation = useDeleteFinancialTransaction();
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = transactions;
  const rows = useMemo(
    () => transactions.data?.pages.flatMap((page) => page.transactions) ?? [],
    [transactions.data?.pages],
  );
  const totalCount = transactions.data?.pages[0]?.pagination.total ?? 0;

  const updateRange = (nextFrom: string, nextTo: string) => {
    const range = clampDateRangeInputs(nextFrom, nextTo, effectiveAllowedRange.from, effectiveAllowedRange.to);

    setRangeWasClamped(range.clamped);
    setFromDate(range.from);
    setToDate(range.to);
  };

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '180px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (transactions.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-black text-stone-950">{t('transactions')}</h3>
        <Badge tone="teal">{t('transactionsCount', { count: totalCount })}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['', t('all')],
          ['IN', t('income')],
          ['OUT', t('expense')],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`h-9 rounded-xl border px-3 text-sm font-black ${type === value ? 'border-primary bg-teal-50 text-primary' : 'border-stone-200 bg-white text-stone-600'}`}
            onClick={() => setType(value as 'IN' | 'OUT' | '')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="min-w-0 space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('fromDate')}</span>
          <input
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-white px-3 text-sm font-bold"
            type="date"
            value={effectiveDateRange.from}
            min={effectiveAllowedRange.from}
            max={effectiveAllowedRange.to}
            onChange={(event) => updateRange(event.target.value, effectiveDateRange.to)}
          />
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('toDate')}</span>
          <input
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-white px-3 text-sm font-bold"
            type="date"
            value={effectiveDateRange.to}
            min={effectiveAllowedRange.from}
            max={effectiveAllowedRange.to}
            onChange={(event) => updateRange(effectiveDateRange.from, event.target.value)}
          />
        </label>
      </div>
      <p className={rangeWasClamped ? 'text-xs font-bold text-amber-700' : 'text-xs font-bold text-muted-foreground'}>
        {t('allowedDateRangeMessage', {
          range: `${effectiveAllowedRange.from} - ${effectiveAllowedRange.to}`,
        })}
      </p>

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((transaction) => (
          <div key={transaction.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={transaction.type === 'IN' ? 'green' : 'amber'}>
                    {transaction.type === 'IN' ? t('income') : t('expense')}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground">
                    {new Date(transaction.occurredAt).toLocaleString(locale)}
                  </span>
                </div>
                <p className="mt-2 text-base font-black text-stone-950">
                  {formatFinanceAmount(transaction.amount, transaction.currency || currency)}
                </p>
                <p className="mt-1 text-sm font-bold text-stone-700">
                  {textForLocale(transaction.category.name, locale)} -{' '}
                  {textForLocale(transaction.branch.name, locale)}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {transaction.paymentMethod
                    ? textForLocale(transaction.paymentMethod.name, locale)
                    : t('noPaymentMethod')}
                </p>
                {transaction.note ? (
                  <p className="mt-2 text-sm text-muted-foreground">{transaction.note}</p>
                ) : null}
              </div>
              <SecondaryButton
                loading={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate(transaction.id, {
                    onSuccess: () => toast.success(t('transactionDeleted')),
                    onError: (error) => toast.error(readError(error)),
                  })
                }
              >
                <Trash2 className="size-4" />
                {t('delete')}
              </SecondaryButton>
            </div>
          </div>
          ))}
          <div ref={loadMoreRef} className="h-6" />
          {isFetchingNextPage ? (
            <p className="text-center text-xs font-black text-muted-foreground">{t('loadingWorkspace')}</p>
          ) : null}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">
          {t('noTransactionsYet')}
        </p>
      )}
    </div>
  );
}
