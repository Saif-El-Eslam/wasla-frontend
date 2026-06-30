'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, Card, cx } from '@/components/ui/dashboard-ui';
import type {
  AdminFeaturesResponse,
  AdminPlansResponse,
  Plan,
  PlanFeature,
  UpdatePlanInput,
} from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { formatAdminMoney } from '../utils/admin-subscriptions';
import { Edit3, Package, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/form-input';
import { AdminFormToggle } from './admin-form-toggle';

type UpdatePlanPayload = {
  planId: string;
  input: UpdatePlanInput;
};

type FeatureAssignmentPayload = {
  planId: string;
  featureId: string;
  mappingId?: string;
  enabled: boolean;
};

type PlanFormValues = {
  publicName: { en: string; ar: string };
  internalName: string;
  description: { en: string; ar: string };
  priceAnnualEgp: string;
  displayOrder: string;
  active: boolean;
  comingSoon: boolean;
};

function localizedDraft(value: Plan['publicName'] | Plan['description'], localeKey: 'en' | 'ar') {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return localeKey === 'en' ? value : '';
  }

  return value[localeKey] ?? '';
}

function numericDraft(value: number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

export function PlanManagement({
  plans,
  features,
  locale,
  onUpdatePlan,
  onSetFeatureAssignment,
  isSavingPlan,
  isSavingFeature,
}: {
  plans: AdminPlansResponse['plans'];
  features: AdminFeaturesResponse['features'];
  locale: string;
  onUpdatePlan: (payload: UpdatePlanPayload) => void;
  onSetFeatureAssignment: (payload: FeatureAssignmentPayload) => void;
  isSavingPlan: boolean;
  isSavingFeature: boolean;
}) {
  const t = useTranslations('admin');

  return (
    <Card className="border-teal-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-2">
          <Package className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-lg font-black text-stone-950">{t('plans.title')}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{t('plans.body')}</p>
          </div>
        </div>
        <Badge tone="teal">{t('plans.count', { count: plans.length })}</Badge>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {plans.map((plan) => (
          <PlanEditorCard
            key={plan.id}
            plan={plan}
            features={features}
            locale={locale}
            onUpdatePlan={onUpdatePlan}
            onSetFeatureAssignment={onSetFeatureAssignment}
            isSavingPlan={isSavingPlan}
            isSavingFeature={isSavingFeature}
          />
        ))}
      </div>

      {plans.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-teal-50 bg-[#f8fafa] p-5 text-sm font-bold text-muted-foreground">
          {t('plans.empty')}
        </p>
      ) : null}
    </Card>
  );
}

function PlanEditorCard({
  plan,
  features,
  locale,
  onUpdatePlan,
  onSetFeatureAssignment,
  isSavingPlan,
  isSavingFeature,
}: {
  plan: Plan;
  features: PlanFeature[];
  locale: string;
  onUpdatePlan: (payload: UpdatePlanPayload) => void;
  onSetFeatureAssignment: (payload: FeatureAssignmentPayload) => void;
  isSavingPlan: boolean;
  isSavingFeature: boolean;
}) {
  const t = useTranslations('admin');
  const [modalOpen, setModalOpen] = useState(false);

  const form = useForm<PlanFormValues>({
    defaultValues: getPlanFormValues(plan),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(getPlanFormValues(plan));
  }, [plan, reset]);

  const mappingsByFeatureId = useMemo(
    () => new Map(plan.featureMappings.map((mapping) => [mapping.featureId, mapping])),
    [plan.featureMappings],
  );

  const assignedCount = plan.featureMappings.filter((mapping) => mapping.enabled).length;
  const displayName = textForLocale(plan.publicName, locale) || plan.code;

  function closeModal() {
    reset(getPlanFormValues(plan));
    setModalOpen(false);
  }

  function savePlan(values: PlanFormValues) {
    const safeInternalName = values.internalName.trim() || plan.internalName;
    const safeNameEn = values.publicName.en.trim() || safeInternalName || plan.code;
    const safeNameAr = values.publicName.ar.trim() || safeNameEn;
    const parsedPrice = Number(values.priceAnnualEgp);
    const parsedOrder = Number(values.displayOrder);

    onUpdatePlan({
      planId: plan.id,
      input: {
        publicName: {
          en: safeNameEn,
          ar: safeNameAr,
        },
        internalName: safeInternalName,
        description: {
          en: values.description.en.trim(),
          ar: values.description.ar.trim(),
        },
        priceAnnualEgp:
          values.priceAnnualEgp.trim() === '' || !Number.isFinite(parsedPrice)
            ? null
            : Math.max(0, Math.trunc(parsedPrice)),
        displayOrder: Number.isFinite(parsedOrder) ? Math.max(0, Math.trunc(parsedOrder)) : plan.displayOrder,
        active: values.active,
        comingSoon: values.comingSoon,
      },
    });

    setModalOpen(false);
  }

  return (
    <>
      <section className="rounded-3xl border border-teal-100 bg-[#f8fafa] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-stone-950">{displayName}</h3>
              <Badge tone={plan.active ? 'teal' : 'amber'}>
                {plan.active ? t('plans.active') : t('plans.inactive')}
              </Badge>
              {plan.comingSoon ? <Badge tone="amber">{t('plans.comingSoon')}</Badge> : null}
            </div>

            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.12em] text-stone-400">
              {plan.code}
            </p>

            <p className="mt-2 text-sm font-black text-primary">
              {plan.priceAnnualEgp === null
                ? t('plans.priceCustom')
                : formatAdminMoney(plan.priceAnnualEgp, locale)}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-teal-100 bg-white text-stone-600 transition hover:text-primary"
            onClick={() => setModalOpen(true)}
            aria-label={t('plans.edit')}
            title={t('plans.edit')}
          >
            <Edit3 className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3">
            <p className="text-lg font-black text-stone-950">{assignedCount}</p>
            <p className="text-xs font-bold text-muted-foreground">{t('plans.featuresTitle')}</p>
          </div>

          <div className="rounded-2xl bg-white p-3">
            <p className="text-lg font-black text-stone-950">{plan.displayOrder}</p>
            <p className="text-xs font-bold text-muted-foreground">{t('plans.displayOrder')}</p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-muted-foreground">
          {textForLocale(plan.description, locale) || t('plans.body')}
        </p>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-5"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-stone-950">{displayName}</h3>
                <p className="mt-1 text-sm font-bold text-muted-foreground">{plan.code}</p>
              </div>

              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-white"
                onClick={closeModal}
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(savePlan)} className="mt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  label={t('plans.publicNameEn')}
                  name="publicName.en"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.publicNameEn')}
                  className={adminInputClassName}
                />

                <FormInput
                  label={t('plans.publicNameAr')}
                  name="publicName.ar"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.publicNameAr')}
                  dir="rtl"
                  className={adminInputClassName}
                />

                <FormInput
                  label={t('plans.internalName')}
                  name="internalName"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.internalName')}
                  className={adminInputClassName}
                />

                <FormInput
                  label={t('plans.priceAnnualEgp')}
                  name="priceAnnualEgp"
                  inputMode="numeric"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.priceAnnualEgp')}
                  className={adminInputClassName}
                />

                <FormInput
                  label={t('plans.displayOrder')}
                  name="displayOrder"
                  inputMode="numeric"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.displayOrder')}
                  className={adminInputClassName}
                />

                <div className="grid items-end gap-2 sm:grid-cols-2">
                  <AdminFormToggle label={t('plans.active')} register={register('active')} />
                  <AdminFormToggle label={t('plans.comingSoon')} register={register('comingSoon')} />
                </div>

                <FormInput
                  label={t('plans.descriptionEn')}
                  name="description.en"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.descriptionEn')}
                  className={adminInputClassName}
                />

                <FormInput
                  label={t('plans.descriptionAr')}
                  name="description.ar"
                  register={register}
                  errors={errors}
                  placeholder={t('plans.descriptionAr')}
                  dir="rtl"
                  className={adminInputClassName}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-teal-100 bg-[#f8fafa] p-3">
                <h4 className="text-sm font-black text-stone-950">{t('plans.featuresTitle')}</h4>
                <p className="mt-0.5 text-xs font-bold text-stone-400">
                  {t('plans.featuresCount', { assigned: assignedCount, total: features.length })}
                </p>

                <div className="mt-3 grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {features.map((feature) => {
                    const mapping = mappingsByFeatureId.get(feature.id);
                    const checked = Boolean(mapping?.enabled);

                    return (
                      <label
                        key={feature.id}
                        className={cx(
                          'flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-3 transition',
                          checked
                            ? 'border-primary bg-teal-50'
                            : 'border-teal-50 bg-white hover:border-teal-100',
                          isSavingFeature ? 'opacity-70' : '',
                        )}
                      >
                        <input
                          className="mt-1 size-4 accent-primary"
                          type="checkbox"
                          checked={checked}
                          disabled={isSavingFeature}
                          onChange={(event) =>
                            onSetFeatureAssignment({
                              planId: plan.id,
                              featureId: feature.id,
                              mappingId: mapping?.id,
                              enabled: event.currentTarget.checked,
                            })
                          }
                        />

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black text-stone-900">
                            {textForLocale(feature.name, locale)}
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-bold text-stone-400">
                            {feature.key} / {feature.valueType}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {features.length === 0 ? (
                  <p className="mt-3 text-sm font-bold text-muted-foreground">{t('plans.noFeatures')}</p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-bold"
                  onClick={closeModal}
                >
                  {t('plans.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
                >
                  <Save className="size-4" />
                  {t('plans.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function getPlanFormValues(plan: Plan): PlanFormValues {
  return {
    publicName: {
      en: localizedDraft(plan.publicName, 'en'),
      ar: localizedDraft(plan.publicName, 'ar'),
    },
    internalName: plan.internalName,
    description: {
      en: localizedDraft(plan.description, 'en'),
      ar: localizedDraft(plan.description, 'ar'),
    },
    priceAnnualEgp: numericDraft(plan.priceAnnualEgp),
    displayOrder: numericDraft(plan.displayOrder),
    active: plan.active,
    comingSoon: plan.comingSoon,
  };
}

const adminInputClassName =
  'h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-bold text-stone-800 outline-none transition placeholder:text-stone-300 focus:border-primary';
