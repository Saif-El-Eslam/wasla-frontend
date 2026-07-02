'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, cx } from '@/components/ui/dashboard-ui';
import type {
  AdminFeaturesResponse,
  AdminPlansResponse,
  PlanFeature,
  PlanFeatureMapping,
  QrBrandingLevel,
  UpdatePlanFeatureMappingInput,
} from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { mappingDraft } from '../../utils/admin-subscriptions';

const qrBrandingOptions: Array<{ value: QrBrandingLevel; labelKey: 'waslaSigned' | 'venueLogo' | 'fullCustom' }> = [
  { value: 'WASLA_SIGNED', labelKey: 'waslaSigned' },
  { value: 'VENUE_LOGO', labelKey: 'venueLogo' },
  { value: 'FULL_CUSTOM', labelKey: 'fullCustom' },
];

type UpdateMappingPayload = {
  mappingId: string;
  input: UpdatePlanFeatureMappingInput;
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
                        <MatrixInput feature={feature} mapping={mapping} mutation={mutation} />
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
  feature,
  mapping,
  mutation,
}: {
  feature: PlanFeature;
  mapping: PlanFeatureMapping;
  mutation: UseMutationResult<unknown, unknown, UpdateMappingPayload>;
}) {
  const t = useTranslations('admin');
  const value = mappingDraft(mapping);
  const fieldClassName = cx(
    'h-10 w-36 rounded-xl border border-teal-100 bg-[#f8fafa] px-3 text-xs font-black text-stone-700 outline-none focus:border-primary',
    mutation.isPending ? 'opacity-60' : '',
  );

  if (feature.key === 'QR_BRANDING') {
    return (
      <select
        className={fieldClassName}
        defaultValue={value}
        disabled={mutation.isPending}
        onChange={(event) => {
          mutation.mutate({ mappingId: mapping.id, input: { valueString: event.currentTarget.value } });
        }}
      >
        {qrBrandingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(`matrix.qrBrandingOptions.${option.labelKey}`)}
          </option>
        ))}
      </select>
    );
  }

  if (feature.valueType === 'BOOLEAN') {
    return (
      <select
        className={fieldClassName}
        defaultValue={mapping.valueBool === null ? '' : String(mapping.valueBool)}
        disabled={mutation.isPending}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          mutation.mutate({
            mappingId: mapping.id,
            input: { valueBool: nextValue === '' ? null : nextValue === 'true' },
          });
        }}
      >
        <option value="">Unset</option>
        <option value="true">Enabled</option>
        <option value="false">Disabled</option>
      </select>
    );
  }

  if (feature.valueType === 'NUMBER') {
    return (
      <input
        className={fieldClassName}
        defaultValue={mapping.valueInt ?? ''}
        disabled={mutation.isPending}
        inputMode="numeric"
        type="number"
        onBlur={(event) => {
          const rawValue = event.currentTarget.value.trim();
          if (rawValue !== value) {
            mutation.mutate({
              mappingId: mapping.id,
              input: { valueInt: rawValue === '' ? null : Number(rawValue) },
            });
          }
        }}
      />
    );
  }

  if (feature.valueType === 'JSON') {
    const jsonValue =
      mapping.valueJson === null || mapping.valueJson === undefined ? '' : JSON.stringify(mapping.valueJson);

    return (
      <input
        className={fieldClassName}
        defaultValue={jsonValue}
        disabled={mutation.isPending}
        onBlur={(event) => {
          const field = event.currentTarget;
          const rawValue = event.currentTarget.value.trim();
          if (rawValue !== jsonValue) {
            let valueJson: unknown = null;
            if (rawValue !== '') {
              try {
                valueJson = JSON.parse(rawValue);
                field.setCustomValidity('');
              } catch {
                field.setCustomValidity('Invalid JSON');
                field.reportValidity();
                return;
              }
            }
            mutation.mutate({
              mappingId: mapping.id,
              input: { valueJson },
            });
          }
        }}
      />
    );
  }

  return (
    <input
      className={fieldClassName}
      defaultValue={value}
      disabled={mutation.isPending}
      onBlur={(event) => {
        if (event.currentTarget.value !== value) {
          mutation.mutate({ mappingId: mapping.id, input: { valueString: event.currentTarget.value } });
        }
      }}
    />
  );
}
