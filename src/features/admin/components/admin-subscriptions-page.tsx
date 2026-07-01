'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Home, Languages, LogOut, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Badge, Card } from '@/components/ui/dashboard-ui';
import { DashboardLoading } from '@/components/ui/dashboard-loading';
import { toast } from '@/components/ui/toast-store';
import { publicLandingHref } from '@/features/auth/utils/pwa-public-navigation';
import { useMe } from '@/features/auth/hooks/use-me';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import type { MenuPlanCode, SubscriptionStatus, UpdatePlanInput } from '@/lib/api/types';
import { AdminHomeTab } from './admin-home-tab';
import { AdminSubscriptionTabs, type AdminSubscriptionTab } from './admin-subscription-tabs';
import { PlanFeatureMatrix } from './plan-feature-matrix';
import { PlanManagement } from './plan-management';
import { VenueSubscriptionManagement } from './venue-subscription-management';

export function AdminSubscriptionsPage({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const me = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminSubscriptionTab>('home');
  const [search, setSearch] = useState('');
  const filters = useMemo(() => ({ search: search.trim() || undefined }), [search]);
  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  const overview = useQuery({
    queryKey: queryKeys.adminSubscriptionOverview,
    queryFn: api.adminSubscriptionOverview,
    enabled: me.data?.role === 'SUPER_ADMIN',
  });
  const venues = useQuery({
    queryKey: queryKeys.adminSubscriptionVenues(filters),
    queryFn: () => api.adminSubscriptionVenues(filters),
    enabled: me.data?.role === 'SUPER_ADMIN',
  });
  const plans = useQuery({
    queryKey: queryKeys.adminPlans,
    queryFn: api.adminPlans,
    enabled: me.data?.role === 'SUPER_ADMIN',
  });
  const features = useQuery({
    queryKey: queryKeys.adminFeatures,
    queryFn: api.adminFeatures,
    enabled: me.data?.role === 'SUPER_ADMIN',
  });

  const updateSubscription = useMutation({
    mutationFn: ({
      venueId,
      plan,
      status,
      currentPeriodEnds,
    }: {
      venueId: string;
      plan: MenuPlanCode;
      status: SubscriptionStatus;
      currentPeriodEnds?: string | null;
    }) =>
      api.updateVenueSubscription(venueId, {
        plan,
        status,
        currentPeriodEnds: currentPeriodEnds || null,
        paymentProvider: 'MANUAL',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSubscriptionOverview });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSubscriptionVenues(filters) });
      toast.success(t('toasts.subscriptionUpdated'));
    },
  });

  const updateMapping = useMutation({
    mutationFn: ({ mappingId, value }: { mappingId: string; value: string }) => {
      if (value === 'true' || value === 'false') {
        return api.updatePlanFeatureMapping(mappingId, { valueBool: value === 'true' });
      }

      const numericValue = Number(value);
      if (Number.isFinite(numericValue) && value.trim() !== '') {
        return api.updatePlanFeatureMapping(mappingId, { valueInt: numericValue });
      }

      return api.updatePlanFeatureMapping(mappingId, { valueString: value });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans });
      toast.success(t('toasts.mappingUpdated'));
    },
  });
  const updatePlan = useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: UpdatePlanInput }) => api.updatePlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSubscriptionOverview });
      toast.success(t('toasts.planUpdated'));
    },
  });
  const setFeatureAssignment = useMutation({
    mutationFn: ({
      planId,
      featureId,
      mappingId,
      enabled,
    }: {
      planId: string;
      featureId: string;
      mappingId?: string;
      enabled: boolean;
    }) => {
      if (mappingId) {
        return api.updatePlanFeatureMapping(mappingId, { enabled });
      }

      return api.createPlanFeatureMapping({ planId, featureId, enabled });
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans });
      toast.success(variables.enabled ? t('toasts.featureAssigned') : t('toasts.featureUnassigned'));
    },
  });
  const logout = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
      router.push(`/${locale}/login`);
    },
  });

  if (me.isLoading) {
    return <DashboardLoading />;
  }

  if (me.data?.role !== 'SUPER_ADMIN') {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f8fafa] px-4">
        <Card className="max-w-md border-teal-100 bg-white p-5">
          <Badge tone="amber">{t('restricted.badge')}</Badge>
          <h1 className="mt-3 text-2xl font-black text-stone-950">{t('restricted.title')}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('restricted.body')}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f8fafa] px-4 py-5 sm:px-6 lg:px-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="size-5" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">{t('eyebrow')}</p>
            </div>
            <div>
              <h1 className="mt-2 text-3xl font-black text-stone-950">{t('title')}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('body')}</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 text-sm font-black text-stone-700 shadow-glass transition hover:border-primary hover:text-primary"
              href={publicLandingHref(locale)}
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">Wasla</span>
            </Link>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 text-sm font-black text-stone-700 shadow-glass transition hover:border-primary hover:text-primary"
              type="button"
              onClick={() => router.push(`/${nextLocale}/admin/subscriptions`)}
            >
              <Languages className="size-4" />
              {t('languageToggle')}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 text-sm font-black text-stone-700 shadow-glass transition hover:border-primary hover:text-primary disabled:opacity-60"
              type="button"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut className="size-4" />
              {t('signOut')}
            </button>
          </div>
        </header>

        <AdminSubscriptionTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'home' ? (
          <AdminHomeTab overview={overview.data} locale={locale} onTabChange={setActiveTab} />
        ) : null}

        {activeTab === 'venues' ? (
          <VenueSubscriptionManagement
            venues={venues.data?.venues ?? []}
            locale={locale}
            search={search}
            onSearchChange={setSearch}
            mutation={updateSubscription}
          />
        ) : null}

        {activeTab === 'matrix' ? (
          <PlanFeatureMatrix
            plans={plans.data?.plans ?? []}
            features={features.data?.features ?? []}
            locale={locale}
            mutation={updateMapping}
          />
        ) : null}

        {activeTab === 'plans' ? (
          <PlanManagement
            plans={plans.data?.plans ?? []}
            features={features.data?.features ?? []}
            locale={locale}
            onUpdatePlan={updatePlan.mutate}
            onSetFeatureAssignment={setFeatureAssignment.mutate}
            isSavingPlan={updatePlan.isPending}
            isSavingFeature={setFeatureAssignment.isPending}
          />
        ) : null}
      </div>
    </main>
  );
}
