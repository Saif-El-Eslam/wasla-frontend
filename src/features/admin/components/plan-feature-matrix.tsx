'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, cx } from '@/components/ui/dashboard-ui';
import type { AdminFeaturesResponse, AdminPlansResponse, PlanFeatureMapping } from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { mappingDraft } from '../utils/admin-subscriptions';

type UpdateMappingPayload = {
  mappingId: string;
  value: string;
};

export function PlanFeatureMatrix({
  plans,
  features,
  locale,
  mutation,
}: {
  plans: AdminPlansResponse['plans'];
  features: AdminFeaturesResponse['features'];
  locale: string;
  mutation: UseMutationResult<unknown, unknown, UpdateMappingPayload>;
}) {
  const t = useTranslations('admin');

  return (
    <Card className="border-teal-100 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h2 className="text-lg font-black text-stone-950">{t('matrix.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('matrix.body')}</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-teal-50">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-[#f8fafa] text-xs uppercase tracking-[0.12em] text-stone-400">
            <tr>
              <th className="px-3 py-3">{t('matrix.feature')}</th>
              {plans.map((plan) => (
                <th key={plan.id} className="pe-3">
                  {textForLocale(plan.publicName, locale)} ({plan.priceAnnualEgp || 0} EGP)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {features.map((feature) => (
              <tr key={feature.id}>
                <td className="px-3 py-3">
                  <p className="max-w-60 truncate font-black text-stone-900">
                    {textForLocale(feature.name, locale)}
                  </p>
                  <p className="max-w-60 truncate text-xs font-bold text-stone-400">{feature.key}</p>
                </td>
                {plans.map((plan) => {
                  const mapping = plan.featureMappings.find((item) => item.featureId === feature.id);

                  return (
                    <td key={plan.id} className="pe-3">
                      {mapping ? (
                        <MatrixInput mapping={mapping} mutation={mutation} />
                      ) : (
                        <span className="text-xs font-bold text-stone-400">{t('matrix.missing')}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {features.length === 0 ? (
          <p className="p-5 text-sm font-bold text-muted-foreground">{t('matrix.empty')}</p>
        ) : null}
      </div>
    </Card>
  );
}

function MatrixInput({
  mapping,
  mutation,
}: {
  mapping: PlanFeatureMapping;
  mutation: UseMutationResult<unknown, unknown, UpdateMappingPayload>;
}) {
  const value = mappingDraft(mapping);

  return (
    <input
      className={cx(
        'h-10 w-32 rounded-xl border border-teal-100 bg-[#f8fafa] px-3 text-xs font-black text-stone-700 outline-none focus:border-primary',
        mutation.isPending ? 'opacity-60' : '',
      )}
      defaultValue={value}
      onBlur={(event) => {
        if (event.currentTarget.value !== value) {
          mutation.mutate({ mappingId: mapping.id, value: event.currentTarget.value });
        }
      }}
    />
  );
}
