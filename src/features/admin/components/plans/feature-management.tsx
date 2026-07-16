'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/dashboard-ui';
import type {
  LocalizedValue,
  Plan,
  PlanFeature,
  PlanFeatureValueType,
  UpdatePlanFeatureInput,
} from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { Edit3, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/form-input';
import { AdminFormToggle } from './admin-form-toggle';
import { UpdateFeaturePayload } from './plan-feature-management';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

type FeatureFormValues = {
  key: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  valueType: PlanFeatureValueType;
  unit: string;
  displayOrder: string;
  active: boolean;
};

const featureValueTypes: PlanFeatureValueType[] = ['BOOLEAN', 'NUMBER', 'TEXT', 'JSON'];

function localizedDraft(value: LocalizedValue | Plan['description'], localeKey: 'en' | 'ar') {
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

export default function FeatureManagement({
  features,
  locale,
  onUpdateFeature,
  isSaving,
}: {
  features: PlanFeature[];
  locale: string;
  onUpdateFeature: (payload: UpdateFeaturePayload) => void;
  isSaving: boolean;
}) {
  const t = useTranslations('admin');

  return (
    <section className="">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-base font-black text-stone-950">{t('plans.featuresCatalogTitle')}</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {t('plans.featuresCatalogBody')}
          </p>
        </div>
        <Badge tone="teal">{t('plans.featuresCatalogCount', { count: features.length })}</Badge>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {features.map((feature) => (
          <FeatureEditorCard
            key={feature.id}
            feature={feature}
            locale={locale}
            isSaving={isSaving}
            onUpdateFeature={onUpdateFeature}
          />
        ))}
      </div>

      {features.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-teal-50 bg-[#f8fafa] p-4 text-sm font-bold text-muted-foreground">
          {t('plans.noFeatures')}
        </p>
      ) : null}
    </section>
  );
}

function FeatureEditorCard({
  feature,
  locale,
  isSaving,
  onUpdateFeature,
}: {
  feature: PlanFeature;
  locale: string;
  isSaving: boolean;
  onUpdateFeature: (payload: UpdateFeaturePayload) => void;
}) {
  const t = useTranslations('admin');
  const [modalOpen, setModalOpen] = useState(false);
  const displayName = textForLocale(feature.name, locale) || feature.key;

  return (
    <>
      <section className="rounded-3xl border border-teal-100 bg-[#f8fafa] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-black text-stone-950">{displayName}</h4>
              <Badge tone={feature.active ? 'teal' : 'amber'}>
                {feature.active ? t('plans.active') : t('plans.inactive')}
              </Badge>
            </div>
            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.12em] text-stone-400">
              {feature.key}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-teal-100 bg-white text-stone-600 transition hover:text-primary disabled:opacity-60"
            disabled={isSaving}
            onClick={() => setModalOpen(true)}
            aria-label={t('plans.editFeature')}
            title={t('plans.editFeature')}
          >
            <Edit3 className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white p-3">
            <p className="truncate text-sm font-black text-stone-950">{feature.valueType}</p>
            <p className="text-xs font-bold text-muted-foreground">{t('plans.featureType')}</p>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <p className="truncate text-sm font-black text-stone-950">{feature.unit || t('notSet')}</p>
            <p className="text-xs font-bold text-muted-foreground">{t('plans.featureUnit')}</p>
          </div>
          <div className="rounded-2xl bg-white p-3">
            <p className="text-sm font-black text-stone-950">{feature.displayOrder}</p>
            <p className="text-xs font-bold text-muted-foreground">{t('plans.displayOrder')}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-muted-foreground">
          {textForLocale(feature.description, locale) || t('plans.noFeatureDescription')}
        </p>
      </section>

      {modalOpen ? (
        <FeatureEditorModal
          feature={feature}
          isSaving={isSaving}
          onClose={() => setModalOpen(false)}
          onSave={(input) => {
            onUpdateFeature({ featureId: feature.id, input });
            setModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function FeatureEditorModal({
  feature,
  isSaving,
  onClose,
  onSave,
}: {
  feature: PlanFeature;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: UpdatePlanFeatureInput) => void;
}) {
  const t = useTranslations('admin');
  const form = useForm<FeatureFormValues>({
    defaultValues: getFeatureFormValues(feature),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(getFeatureFormValues(feature));
  }, [feature, reset]);

  function saveFeature(values: FeatureFormValues) {
    const safeKey = values.key.trim() || feature.key;
    const currentEn = localizedDraft(feature.name, 'en') || feature.key;
    const safeNameEn = values.name.en.trim() || currentEn;
    const safeNameAr = values.name.ar.trim() || safeNameEn;
    const parsedOrder = Number(values.displayOrder);

    onSave({
      key: safeKey,
      name: {
        en: safeNameEn,
        ar: safeNameAr,
      },
      description: {
        en: values.description.en.trim(),
        ar: values.description.ar.trim(),
      },
      valueType: values.valueType,
      unit: values.unit.trim() || null,
      displayOrder: Number.isFinite(parsedOrder)
        ? Math.max(0, Math.trunc(parsedOrder))
        : feature.displayOrder,
      active: values.active,
    });
  }

  return (
    <Dialog open onClose={onClose} className="relative z-[60]">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
      <DialogPanel className="w-full max-w-xl rounded-3xl bg-white p-4 shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-black text-stone-950">{t('plans.editFeature')}</DialogTitle>
            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.12em] text-stone-400">
              {feature.key} / {feature.valueType}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-white"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(saveFeature)} className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormInput
              label={t('plans.featureKey')}
              name="key"
              register={register}
              errors={errors}
              placeholder={t('plans.featureKey')}
              className={`${adminInputClassName} uppercase`}
            />

            <label className="grid gap-1.5 text-sm font-bold text-stone-700">
              {t('plans.featureType')}
              <select className={adminInputClassName} {...register('valueType')}>
                {featureValueTypes.map((valueType) => (
                  <option key={valueType} value={valueType}>
                    {valueType}
                  </option>
                ))}
              </select>
            </label>

            <FormInput
              label={t('plans.featureNameEn')}
              name="name.en"
              register={register}
              errors={errors}
              placeholder={t('plans.featureNameEn')}
              className={adminInputClassName}
            />

            <FormInput
              label={t('plans.featureNameAr')}
              name="name.ar"
              register={register}
              errors={errors}
              placeholder={t('plans.featureNameAr')}
              dir="rtl"
              className={adminInputClassName}
            />

            <FormInput
              label={t('plans.featureUnit')}
              name="unit"
              register={register}
              errors={errors}
              placeholder={t('plans.featureUnit')}
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

            <FormInput
              label={t('plans.featureDescriptionEn')}
              name="description.en"
              register={register}
              errors={errors}
              placeholder={t('plans.featureDescriptionEn')}
              className={adminInputClassName}
            />

            <FormInput
              label={t('plans.featureDescriptionAr')}
              name="description.ar"
              register={register}
              errors={errors}
              placeholder={t('plans.featureDescriptionAr')}
              dir="rtl"
              className={adminInputClassName}
            />

            <div className="grid items-end gap-2">
              <AdminFormToggle label={t('plans.featureActive')} register={register('active')} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-bold"
              onClick={onClose}
            >
              {t('plans.cancel')}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              <Save className="size-4" />
              {t('plans.saveFeature')}
            </button>
          </div>
        </form>
      </DialogPanel>
      </div>
    </Dialog>
  );
}

function getFeatureFormValues(feature: PlanFeature): FeatureFormValues {
  return {
    key: feature.key,
    name: {
      en: localizedDraft(feature.name, 'en'),
      ar: localizedDraft(feature.name, 'ar'),
    },
    description: {
      en: localizedDraft(feature.description, 'en'),
      ar: localizedDraft(feature.description, 'ar'),
    },
    valueType: feature.valueType,
    unit: feature.unit ?? '',
    displayOrder: numericDraft(feature.displayOrder),
    active: feature.active,
  };
}

const adminInputClassName =
  'h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-bold text-stone-800 outline-none transition placeholder:text-stone-300 focus:border-primary';
