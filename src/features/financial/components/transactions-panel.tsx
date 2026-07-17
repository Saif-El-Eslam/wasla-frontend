'use client';

import { BarChart3, List, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Badge,
  BranchSelect,
  QueryErrorState,
  SecondaryButton,
  TabLoader,
  cx,
} from '@/components/ui/dashboard-ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
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
import type { BranchOption } from '@/lib/api';
import { useDeleteFinancialTransaction, useFinanceAccess, useInfiniteFinancialTransactions } from '../hooks/use-financial';
import type { FinancialFilters } from '../types/financial.types';
import { formatFinanceAmount } from '../utils/financial-format';
import { FinancialInsightsPanel } from './financial-insights-panel';

export function TransactionsPanel({
  branches,
  currency,
  locale,
  timeZone,
}: {
  branches: BranchOption[];
  currency: string;
  locale: string;
  timeZone?: string;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
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
  const [view, setView] = useState<'transactions' | 'insights'>('transactions');
  const [branchId, setBranchId] = useState('all');
  const [type, setType] = useState<'IN' | 'OUT' | ''>('');
  const [fromDate, setFromDate] = useState(() => currentMonthStartDateInTimeZone(timeZone));
  const [toDate, setToDate] = useState(() => dateInputValueInTimeZone(new Date(), timeZone));
  const [rangeWasClamped, setRangeWasClamped] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const effectiveDateRange = useMemo(
    () => clampDateRangeInputs(fromDate, toDate, effectiveAllowedRange.from, effectiveAllowedRange.to),
    [effectiveAllowedRange.from, effectiveAllowedRange.to, fromDate, toDate],
  );
  const baseFilters = useMemo<FinancialFilters>(
    () => ({
      branchId: branchId === 'all' ? undefined : branchId,
      type: type || undefined,
      from: startOfDateInputInTimeZone(effectiveDateRange.from, timeZone),
      to: endOfDateInputInTimeZone(effectiveDateRange.to, timeZone),
    }),
    [branchId, effectiveDateRange.from, effectiveDateRange.to, timeZone, type],
  );
  const transactionFilters = useMemo(() => ({ ...baseFilters, limit: 10 }), [baseFilters]);
  const transactions = useInfiniteFinancialTransactions(transactionFilters, view === 'transactions');
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
    if (view !== 'transactions') {
      return undefined;
    }

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, view]);

  if (access.isLoading || (view === 'transactions' && transactions.isLoading)) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (access.isError || (view === 'transactions' && transactions.isError)) {
    return (
      <QueryErrorState
        onRetry={() => {
          void access.refetch();
          if (view === 'transactions') void transactions.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-2xl border border-stone-200 bg-stone-100 p-1"
          role="tablist"
          aria-label={t('financialActivityViews')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'transactions'}
            className={cx(
              'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-black',
              view === 'transactions'
                ? 'bg-white text-stone-950 shadow-sm'
                : 'text-stone-500 hover:text-stone-950',
            )}
            onClick={() => setView('transactions')}
          >
            <List className="size-4" aria-hidden="true" />
            {t('transactions')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'insights'}
            className={cx(
              'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-black',
              view === 'insights'
                ? 'bg-white text-primary shadow-sm'
                : 'text-stone-500 hover:text-stone-950',
            )}
            onClick={() => setView('insights')}
          >
            <BarChart3 className="size-4" aria-hidden="true" />
            {t('insights')}
          </button>
        </div>
        {view === 'transactions' ? (
          <Badge tone="teal">{t('transactionsCount', { count: totalCount })}</Badge>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0 space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('branchFilter')}</span>
          <BranchSelect
            branches={branches}
            value={branchId}
            onChange={setBranchId}
            locale={locale}
            includeAll
            allLabel={t('allBranches')}
          />
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
              aria-pressed={type === value}
              className={`h-10 rounded-xl border px-3 text-sm font-black ${type === value ? 'border-primary bg-teal-50 text-primary' : 'border-stone-200 bg-white text-stone-600'}`}
              onClick={() => setType(value as 'IN' | 'OUT' | '')}
            >
              {label}
            </button>
          ))}
        </div>
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

      {view === 'insights' ? (
        <FinancialInsightsPanel filters={baseFilters} currency={currency} locale={locale} />
      ) : rows.length ? (
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
                onClick={() => setPendingDeleteId(transaction.id)}
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
          ) : hasNextPage ? (
            <div className="text-center">
              <SecondaryButton onClick={() => void fetchNextPage()}>{commonT('loadMore')}</SecondaryButton>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">
          {t('noTransactionsYet')}
        </p>
      )}
      <ConfirmationModal
        open={Boolean(pendingDeleteId)}
        setOpen={(open) => !open && setPendingDeleteId(null)}
        title={t('deleteTransactionTitle')}
        description={t('deleteTransactionWarning')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        confirmLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!pendingDeleteId) return;
          deleteMutation.mutate(pendingDeleteId, {
            onSuccess: () => {
              setPendingDeleteId(null);
              toast.success(t('transactionDeleted'));
            },
            onError: (error) => toast.error(readError(error)),
          });
        }}
      />
    </div>
  );
}
