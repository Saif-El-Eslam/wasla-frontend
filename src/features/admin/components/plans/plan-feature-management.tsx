'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, Card } from '@/components/ui/dashboard-ui';
import type {
  AdminFeaturesResponse,
  AdminPlansResponse,
  UpdatePlanFeatureInput,
  UpdatePlanInput,
} from '@/lib/api/types';
import { Package, Settings2 } from 'lucide-react';
import PlanManagement from './plan-management';
import FeatureManagement from './feature-management';

export type UpdatePlanPayload = {
  planId: string;
  input: UpdatePlanInput;
};

export type FeatureAssignmentPayload = {
  planId: string;
  featureId: string;
  mappingId?: string;
  enabled: boolean;
};

export type UpdateFeaturePayload = {
  featureId: string;
  input: UpdatePlanFeatureInput;
};
type Tab = 'plans' | 'features';

export default function PlanFeatureManagement({
  plans,
  features,
  locale,
  onUpdatePlan,
  onUpdateFeature,
  onSetFeatureAssignment,
  isSavingPlan,
  isSavingFeatureDetails,
  isSavingFeature,
}: {
  plans: AdminPlansResponse['plans'];
  features: AdminFeaturesResponse['features'];
  locale: string;
  onUpdatePlan: (payload: UpdatePlanPayload) => void;
  onUpdateFeature: (payload: UpdateFeaturePayload) => void;
  onSetFeatureAssignment: (payload: FeatureAssignmentPayload) => void;
  isSavingPlan: boolean;
  isSavingFeatureDetails: boolean;
  isSavingFeature: boolean;
}) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<Tab>('plans');

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-2">
          <Package className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-lg font-black text-stone-950">{t('plans.title')}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{t('plans.body')}</p>
          </div>
        </div>

        <Badge tone="teal">
          {t('plans.summaryCount', {
            plans: plans.length,
            features: features.length,
          })}
        </Badge>
      </div>

      <div className="mt-6 border-b border-stone-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 rounded-t-2xl px-4 py-2 text-sm font-black transition ${
              activeTab === 'plans'
                ? 'border border-b-white border-stone-200 bg-white text-stone-950'
                : 'text-muted-foreground hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Package className="size-4" />
            Plans
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 rounded-t-2xl px-4 py-2 text-sm font-black transition ${
              activeTab === 'features'
                ? 'border border-b-white border-stone-200 bg-white text-stone-950'
                : 'text-muted-foreground hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Settings2 className="size-4" />
            Features
          </button>
        </div>
      </div>

      <div className="pt-5">
        {activeTab === 'plans' ? (
          <PlanManagement
            plans={plans}
            features={features}
            locale={locale}
            onUpdatePlan={onUpdatePlan}
            onSetFeatureAssignment={onSetFeatureAssignment}
            isSavingPlan={isSavingPlan}
            isSavingFeature={isSavingFeature}
          />
        ) : (
          <FeatureManagement
            features={features}
            locale={locale}
            onUpdateFeature={onUpdateFeature}
            isSaving={isSavingFeatureDetails}
          />
        )}
      </div>
    </Card>
  );
}
