'use client';

import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrimaryButton, SecondaryButton, TabLoader } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { textForLocale } from '@/lib/localized-text';
import {
  useCreateTransactionCategory,
  useDeleteTransactionCategory,
  useTransactionCategories,
  useUpdateTransactionCategory,
} from '../hooks/use-financial';
import type { FinancialTransactionType } from '../types/financial.types';

export function CategoriesPanel({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const [type, setType] = useState<FinancialTransactionType>('OUT');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const categories = useTransactionCategories(undefined, true);
  const createMutation = useCreateTransactionCategory();
  const updateMutation = useUpdateTransactionCategory();
  const deleteMutation = useDeleteTransactionCategory();

  if (categories.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  const create = () => {
    createMutation.mutate(
      {
        type,
        name: { en: nameEn.trim(), ar: nameAr.trim() },
      },
      {
        onSuccess: () => {
          setNameEn('');
          setNameAr('');
          toast.success(t('categorySaved'));
        },
        onError: (error) => toast.error(readError(error)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[140px_1fr_1fr_auto]">
          <select className="h-11 rounded-xl border border-border bg-white px-3 text-sm font-bold" value={type} onChange={(event) => setType(event.target.value as FinancialTransactionType)}>
            <option value="IN">{t('income')}</option>
            <option value="OUT">{t('expense')}</option>
          </select>
          <input className="h-11 rounded-xl border border-border px-3 text-sm font-bold" value={nameEn} onChange={(event) => setNameEn(event.target.value)} placeholder={t('nameEnglish')} />
          <input className="h-11 rounded-xl border border-border px-3 text-sm font-bold" value={nameAr} onChange={(event) => setNameAr(event.target.value)} placeholder={t('nameArabic')} />
          <PrimaryButton onClick={create} loading={createMutation.isPending} disabled={!nameEn.trim() || !nameAr.trim()}>
            <Plus className="size-4" />
            {t('add')}
          </PrimaryButton>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {(categories.data?.categories ?? []).map((category) => {
          const transactionCount = category.transactionCount ?? 0;

          return (
          <div key={category.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-stone-950">{textForLocale(category.name, locale)}</p>
                <p className="text-xs font-bold text-muted-foreground">
                  {category.type === 'IN' ? t('income') : t('expense')} - {category.active ? t('active') : t('inactive')} - {t('transactionsCount', { count: transactionCount })}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <SecondaryButton
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      categoryId: category.id,
                      input: { active: !category.active },
                    }, {
                      onSuccess: () => toast.success(category.active ? t('categoryDeactivated') : t('categoryActivated')),
                      onError: (error) => toast.error(readError(error)),
                    })
                  }
                >
                  {category.active ? <ToggleRight className="size-4 text-emerald-600" /> : <ToggleLeft className="size-4 text-stone-500" />}
                  {category.active ? t('deactivate') : t('activate')}
                </SecondaryButton>
                {transactionCount === 0 ? (
                  <SecondaryButton
                    disabled={deleteMutation.isPending}
                    onClick={() =>
                      deleteMutation.mutate(category.id, {
                        onSuccess: () => toast.success(t('categoryDeleted')),
                        onError: (error) => toast.error(readError(error)),
                      })
                    }
                  >
                    <Trash2 className="size-4 text-red-600" />
                    {t('delete')}
                  </SecondaryButton>
                ) : null}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
