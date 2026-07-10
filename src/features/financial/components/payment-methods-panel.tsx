'use client';

import { Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrimaryButton, SecondaryButton, TabLoader } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { textForLocale } from '@/lib/localized-text';
import { useCreatePaymentMethod, useDeletePaymentMethod, usePaymentMethods, useUpdatePaymentMethod } from '../hooks/use-financial';

export function PaymentMethodsPanel({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const methods = usePaymentMethods(true);
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  if (methods.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  const create = () => {
    createMutation.mutate(
      {
        name: { en: nameEn.trim(), ar: nameAr.trim() },
      },
      {
        onSuccess: () => {
          setNameEn('');
          setNameAr('');
          toast.success(t('paymentMethodSaved'));
        },
        onError: (error) => toast.error(readError(error)),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input className="h-11 rounded-xl border border-border px-3 text-sm font-bold" value={nameEn} onChange={(event) => setNameEn(event.target.value)} placeholder={t('nameEnglish')} />
          <input className="h-11 rounded-xl border border-border px-3 text-sm font-bold" value={nameAr} onChange={(event) => setNameAr(event.target.value)} placeholder={t('nameArabic')} />
          <PrimaryButton onClick={create} loading={createMutation.isPending} disabled={!nameEn.trim() || !nameAr.trim()}>
            <Plus className="size-4" />
            {t('add')}
          </PrimaryButton>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {(methods.data?.paymentMethods ?? []).map((method) => {
          const transactionCount = method.transactionCount ?? 0;

          return (
          <div key={method.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-stone-950">{textForLocale(method.name, locale)}</p>
                <p className="text-xs font-bold text-muted-foreground">
                  {method.active ? t('active') : t('inactive')} - {t('transactionsCount', { count: transactionCount })}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <SecondaryButton
                  loading={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      paymentMethodId: method.id,
                      input: { active: !method.active },
                    }, {
                      onSuccess: () => toast.success(method.active ? t('paymentMethodDeactivated') : t('paymentMethodActivated')),
                      onError: (error) => toast.error(readError(error)),
                    })
                  }
                >
                  {method.active ? <ToggleRight className="size-4 text-emerald-600" /> : <ToggleLeft className="size-4 text-stone-500" />}
                  {method.active ? t('deactivate') : t('activate')}
                </SecondaryButton>
                {transactionCount === 0 ? (
                  <SecondaryButton
                    loading={deleteMutation.isPending}
                    onClick={() =>
                      deleteMutation.mutate(method.id, {
                        onSuccess: () => toast.success(t('paymentMethodDeleted')),
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
