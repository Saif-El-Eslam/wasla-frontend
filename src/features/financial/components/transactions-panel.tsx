'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, SecondaryButton, TabLoader } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { textForLocale } from '@/lib/localized-text';
import { useDeleteFinancialTransaction, useFinancialTransactions } from '../hooks/use-financial';
import { formatFinanceAmount } from '../utils/financial-format';

export function TransactionsPanel({
  locale,
  currency,
}: {
  locale: string;
  currency: string;
}) {
  const t = useTranslations('dashboard');
  const [type, setType] = useState<'IN' | 'OUT' | ''>('');
  const transactions = useFinancialTransactions({ type: type || undefined, limit: 50 });
  const deleteMutation = useDeleteFinancialTransaction();

  if (transactions.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (!transactions.data?.transactions.length) {
    return <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-5 text-sm font-bold text-muted-foreground">{t('noTransactionsYet')}</p>;
  }

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        {transactions.data.transactions.map((transaction) => (
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
                  {textForLocale(transaction.category.name, locale)} - {textForLocale(transaction.branch.name, locale)}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {transaction.paymentMethod ? textForLocale(transaction.paymentMethod.name, locale) : t('noPaymentMethod')}
                </p>
                {transaction.note ? <p className="mt-2 text-sm text-muted-foreground">{transaction.note}</p> : null}
              </div>
              <SecondaryButton
                disabled={deleteMutation.isPending}
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
      </div>
    </div>
  );
}
