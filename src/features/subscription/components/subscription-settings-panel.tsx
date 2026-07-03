'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Check, X, Crown, MessageCircle, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, PrimaryButton, cx } from '@/components/ui/dashboard-ui';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import type { Plan, PlanFeatureMapping, TenantSubscriptionResponse } from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { useParams } from 'next/navigation';

type FeatureLabels = {
  included: string;
  notIncluded: string;
  unlimited: string;
};

// function featureValue(mapping: PlanFeatureMapping | undefined, labels: FeatureLabels) {
//   if (!mapping || !mapping.enabled) return labels.notIncluded;
//   if (mapping.valueBool !== null) return mapping.valueBool ? labels.included : labels.notIncluded;
//   if (mapping.valueString) return mapping.valueString.replaceAll('_', ' ').toLowerCase();
//   if (mapping.valueInt !== null)
//     return mapping.valueInt >= 999999 ? labels.unlimited : String(mapping.valueInt);
//   return labels.included;
// }
function featureValue(
  mapping: PlanFeatureMapping | undefined,
  labels: FeatureLabels,
): {
  value: string;
  checked: boolean;
} {
  if (!mapping || !mapping.enabled) {
    return {
      value: labels.notIncluded,
      checked: false,
    };
  }

  if (mapping.valueBool !== null) {
    return {
      value: mapping.valueBool ? labels.included : labels.notIncluded,
      checked: mapping.valueBool,
    };
  }

  if (mapping.valueString) {
    return {
      value: mapping.valueString.replaceAll('_', ' ').toLowerCase(),
      checked: true,
    };
  }

  if (mapping.valueInt !== null) {
    return {
      value: mapping.valueInt >= 999999 ? labels.unlimited : String(mapping.valueInt),
      checked: mapping.valueInt > 0,
    };
  }

  return {
    value: labels.included,
    checked: true,
  };
}

function usagePercent(used: number, limit: number | null, unlimited: boolean) {
  if (unlimited || !limit) return 35;
  return Math.min(Math.round((used / limit) * 100), 100);
}

function UsageMeter({
  label,
  used,
  limit,
  unlimited,
  unlimitedLabel,
}: {
  label: string;
  used: number;
  limit: number | null;
  unlimited: boolean;
  unlimitedLabel: string;
}) {
  const percent = usagePercent(used, limit, unlimited);

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-stone-800">{label}</p>
        <p className="text-xs font-black text-stone-500">
          {used} / {unlimited ? unlimitedLabel : limit}
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-stone-100">
        <div
          className={cx('h-full rounded-full', percent > 90 ? 'bg-amber-500' : 'bg-teal-500')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CurrentPlanCard({ data, locale }: { data: TenantSubscriptionResponse; locale: string }) {
  const t = useTranslations('subscription');
  const statusTone = data.subscription.status === 'PAST_DUE' ? 'amber' : 'teal';
  const currentPlan = data.plans.find((plan) => plan.code === data.subscription.plan);

  return (
    <Card className="border-teal-100 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge tone={statusTone}>{data.subscription.status.replaceAll('_', ' ')}</Badge>
          <h2 className="mt-3 text-2xl font-black text-stone-950">
            {currentPlan ? textForLocale(currentPlan.publicName, locale) : data.subscription.plan}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t('currentPlanBody')}</p>
        </div>
        {data.subscription.status === 'PAST_DUE' ? (
          <div className="flex max-w-md gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <p className="font-bold leading-6">{t('pastDueBanner')}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <UsageMeter
          label={t('usage.branches')}
          used={data.usage.branches}
          limit={data.subscription.limits.branches}
          unlimited={data.subscription.limits.unlimitedBranches}
          unlimitedLabel={t('unlimited')}
        />
        <UsageMeter
          label={t('usage.aiExtractions')}
          used={data.usage.extractionsThisMonth}
          limit={data.subscription.limits.monthlyExtractions}
          unlimited={data.subscription.limits.unlimitedExtractions}
          unlimitedLabel={t('unlimited')}
        />
        <UsageMeter
          label={t('usage.teamUsers')}
          used={data.usage.users}
          limit={data.subscription.limits.staffUsers}
          unlimited={data.subscription.limits.unlimitedStaffUsers}
          unlimitedLabel={t('unlimited')}
        />
        <UsageMeter
          label={t('usage.languages')}
          used={data.usage.languages}
          limit={data.subscription.limits.languages}
          unlimited={data.subscription.limits.unlimitedLanguages}
          unlimitedLabel={t('unlimited')}
        />
      </div>
    </Card>
  );
}

function PricingCard({ plan, active, locale }: { plan: Plan; active: boolean; locale: string }) {
  const t = useTranslations('subscription');
  const labels = { included: t('included'), notIncluded: t('notIncluded'), unlimited: t('unlimited') };

  const yearlyPrice =
    plan.priceAnnualEgp === null ? t('premium') : t('priceAnnual', { price: plan.priceAnnualEgp });
  const branchLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'BRANCH_LIMIT'),
    labels,
  );
  const extractionLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'GEMINI_EXTRACTIONS_MONTHLY'),
    labels,
  );
  const imgPerExtractionLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'GEMINI_IMAGES_PER_EXTRACTION'),
    labels,
  );
  const analyticsLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'ANALYTICS_HISTORY_DAYS'),
    labels,
  );
  const qrBranding = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'QR_BRANDING'),
    labels,
  );
  const staffUsersLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'STAFF_USERS'),
    labels,
  );
  const languagesLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'LANGUAGES'),
    labels,
  );
  const financeModuleLimit = featureValue(
    plan.featureMappings.find((item) => item.feature.key === 'FINANCE_MODULE'),
    labels,
  );

  console.log('plan.branchLimit', branchLimit, typeof branchLimit);
  console.log('plan.extractionLimit', extractionLimit);
  console.log('plan.imgPerExtractionLimit', imgPerExtractionLimit);

  return (
    <Card
      className={cx(
        'flex h-full flex-col border-teal-100 bg-white p-5',
        active ? 'ring-2 ring-teal-400' : '',
        plan.comingSoon ? 'opacity-75' : '',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-stone-950">{textForLocale(plan.publicName, locale)}</h3>
          <p className="mt-1 text-sm font-black text-primary">{yearlyPrice}</p>
        </div>
        {active ? (
          <Badge tone="teal">{t('current')}</Badge>
        ) : plan.comingSoon ? (
          <Badge tone="amber">{t('comingSoon')}</Badge>
        ) : null}
      </div>
      <div className="mt-4 space-y-3 text-sm font-bold text-stone-600">
        {[
          {
            label: t('planBullets.branches', { value: branchLimit.value }),
            checked: branchLimit.checked,
          },
          {
            label: t('planBullets.extractions', { value: extractionLimit.value }),
            checked: extractionLimit.checked,
          },
          {
            label: t('planBullets.imagesPerExtraction', {
              value: imgPerExtractionLimit.value,
            }),
            checked: imgPerExtractionLimit.checked,
          },
          {
            label: t('planBullets.analytics', { value: analyticsLimit.value }),
            checked: analyticsLimit.checked,
          },
          {
            label: t('planBullets.qrBranding', { value: qrBranding.value }),
            checked: qrBranding.checked,
          },
          {
            label: t('planBullets.staffUsers', { value: staffUsersLimit.value }),
            checked: staffUsersLimit.checked,
          },
          {
            label: t('planBullets.languages', { value: languagesLimit.value }),
            checked: languagesLimit.checked,
          },
          {
            label: t('planBullets.financeModule', {
              value: financeModuleLimit.value,
            }),
            checked: financeModuleLimit.checked,
          },
        ].map((item) => (
          <div key={item.label} className="flex gap-2">
            {item.checked ? (
              <Check className="mt-0.5 size-4 shrink-0 text-teal-500" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-red-500" />
            )}

            <span className="capitalize">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <a
          className={cx(
            'inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition',
            active || plan.comingSoon
              ? 'border border-stone-200 bg-stone-50 text-stone-400'
              : 'bg-primary text-white shadow-lg shadow-teal-100 hover:bg-teal-700',
          )}
          href={active || plan.comingSoon ? undefined : plan.upgradeUrl}
          target="_blank"
          rel="noreferrer"
          aria-disabled={active || plan.comingSoon}
        >
          <MessageCircle className="size-4" />
          {active ? t('activePlan') : plan.comingSoon ? t('comingSoon') : t('upgradeWhatsapp')}
        </a>
      </div>
    </Card>
  );
}

export function SubscriptionSettingsPanel() {
  const t = useTranslations('subscription');
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? 'en';
  const subscription = useQuery({
    queryKey: queryKeys.subscription,
    queryFn: api.subscription,
  });

  if (subscription.isLoading) {
    return <Card className="h-72 animate-pulse border-teal-100 bg-white">{null}</Card>;
  }

  if (!subscription.data) {
    return null;
  }

  return (
    <div className="space-y-5">
      <CurrentPlanCard data={subscription.data} locale={locale} />
      {!subscription.data.canManageBilling ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          {t('ownerOnlyBilling')}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('planMatrixEyebrow')}
          </p>
          <h2 className="mt-1 text-2xl font-black text-stone-950">{t('menuSaasPlans')}</h2>
        </div>
        <PrimaryButton
          className="w-full sm:w-auto"
          onClick={() => window.open(subscription.data.plans[1]?.upgradeUrl, '_blank')}
        >
          <Crown className="size-4" />
          {t('upgrade')}
          <ArrowUpRight className="size-4" />
        </PrimaryButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subscription.data.plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            locale={locale}
            active={plan.code === subscription.data.subscription.plan}
          />
        ))}
      </div>
    </div>
  );
}
