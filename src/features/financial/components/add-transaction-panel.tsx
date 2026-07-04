'use client';

import { Save, SaveAll } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrimaryButton, SecondaryButton, cx } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { dateTimeInputToUtcIso, dateTimeInputValueInTimeZone } from '@/lib/date';
import type { LocalizedValue } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';
import {
  useCreateFinancialTransaction,
  usePaymentMethods,
  useTransactionCategories,
} from '../hooks/use-financial';
import type { FinancialTransactionType } from '../types/financial.types';

const defaultPaymentMethodValue = '__default_payment_method__';

export function AddTransactionPanel({
  branches,
  locale,
  onClose,
  timeZone,
}: {
  branches: Array<{ id: string; name: LocalizedValue; slug: string; active: boolean; isMain?: boolean }>;
  locale: string;
  onClose?: () => void;
  timeZone?: string;
}) {
  const t = useTranslations('dashboard');
  const [type, setType] = useState<FinancialTransactionType>('OUT');
  const [branchId, setBranchId] = useState(
    branches.find((branch) => branch.active)?.id ?? branches[0]?.id ?? '',
  );
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(defaultPaymentMethodValue);
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => dateTimeInputValueInTimeZone(new Date(), timeZone));
  const [note, setNote] = useState('');
  const categories = useTransactionCategories(type);
  const paymentMethods = usePaymentMethods();
  const mutation = useCreateFinancialTransaction();
  const categoryOptions = categories.data?.categories ?? [];
  const methodOptions = paymentMethods.data?.paymentMethods ?? [];
  const maxOccurredAt = dateTimeInputValueInTimeZone(new Date(), timeZone);
  const effectiveCategoryId = categoryOptions.some((category) => category.id === categoryId)
    ? categoryId
    : (categoryOptions[0]?.id ?? '');
  const selectedPaymentMethodId = methodOptions.some((method) => method.id === paymentMethodId)
    ? paymentMethodId
    : defaultPaymentMethodValue;
  const canSubmit = Boolean(branchId && effectiveCategoryId && amount);

  const branchOptions = useMemo(() => branches.filter((branch) => branch.active), [branches]);

  const submit = (addAnother: boolean) => {
    if (!canSubmit) {
      toast.error(t('financeValidationTitle'), t('financeValidationBody'));
      return;
    }

    mutation.mutate(
      {
        type,
        branchId,
        categoryId: effectiveCategoryId,
        ...(selectedPaymentMethodId === defaultPaymentMethodValue
          ? {}
          : { paymentMethodId: selectedPaymentMethodId }),
        amount: Number(amount),
        occurredAt: dateTimeInputToUtcIso(occurredAt, timeZone),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('transactionSaved'));
          setCategoryId(effectiveCategoryId);
          setPaymentMethodId(selectedPaymentMethodId);
          if (addAnother) {
            setAmount('');
            setNote('');
            setOccurredAt(dateTimeInputValueInTimeZone(new Date(), timeZone));
          } else {
            onClose?.();
          }
        },
        onError: (error) => toast.error(readError(error)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
        {(['IN', 'OUT'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={cx(
              'h-11 rounded-xl text-sm font-black transition',
              type === item
                ? item === 'IN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-red-600 text-white shadow-sm'
                : 'text-stone-600',
            )}
            onClick={() => {
              setType(item);
              setCategoryId('');
            }}
          >
            {item === 'IN' ? t('income') : t('expense')}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('branch')}</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
          >
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {textForLocale(branch.name, locale) || branch.slug}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('category')}</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            value={effectiveCategoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={categories.isLoading || !categoryOptions.length}
          >
            {categories.isLoading ? <option value="">{t('loadingWorkspace')}</option> : null}
            {!categories.isLoading && !categoryOptions.length ? (
              <option value="">{t('noFinanceCategories')}</option>
            ) : null}
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {textForLocale(category.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('paymentMethod')}</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            value={selectedPaymentMethodId}
            onChange={(event) => setPaymentMethodId(event.target.value)}
            disabled={paymentMethods.isLoading}
          >
            <option value={defaultPaymentMethodValue}>
              {paymentMethods.isLoading ? t('loadingWorkspace') : t('defaultPaymentMethod')}
            </option>
            {methodOptions.map((method) => (
              <option key={method.id} value={method.id}>
                {textForLocale(method.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('amount')}</span>
          <input
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-bold"
            inputMode="decimal"
            value={amount}
            onChange={(event) => {
              const value = event.target.value;

              // Allow empty string (for deleting) or positive decimal numbers
              if (/^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            placeholder="0.00"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-black text-stone-700">{t('date')}</span>
          <input
            className="h-11 w-full min-w-0 rounded-xl border border-border bg-white px-3 text-sm font-bold"
            type="datetime-local"
            value={occurredAt}
            max={maxOccurredAt}
            onChange={(event) =>
              setOccurredAt(event.target.value > maxOccurredAt ? maxOccurredAt : event.target.value)
            }
          />
        </label>
        <label className="space-y-1.5 lg:col-span-2">
          <span className="text-sm font-black text-stone-700">{t('noteOptional')}</span>
          <textarea
            className="min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold outline-none focus:border-primary"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
          />
        </label>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-stone-200 bg-[#f8fafa]/95 py-3 backdrop-blur sm:flex-row sm:justify-end">
        <SecondaryButton onClick={() => submit(true)} disabled={mutation.isPending || !canSubmit}>
          <SaveAll className="size-4" />
          {t('saveAndAddAnother')}
        </SecondaryButton>
        <PrimaryButton onClick={() => submit(false)} loading={mutation.isPending} disabled={!canSubmit}>
          <Save className="size-4" />
          {t('saveTransaction')}
        </PrimaryButton>
      </div>
    </div>
  );
}
