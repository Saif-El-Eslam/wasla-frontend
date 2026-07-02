import { apiClient, toQueryString } from '@/lib/api/axios';
import type {
  AdminFeaturesResponse,
  AdminPlansResponse,
  AdminSubscriptionOverview,
  AdminVenuesResponse,
  CreatePlanFeatureMappingInput,
  MenuPlanCode,
  SubscriptionStatus,
  TenantSubscriptionResponse,
  UpdatePlanFeatureInput,
  UpdatePlanFeatureMappingInput,
  UpdatePlanInput,
  UpdateVenueSubscriptionInput,
} from '@/lib/api/types';

export const subscriptionService = {
  tenant() {
    return apiClient<TenantSubscriptionResponse>('/subscription');
  },
  adminOverview() {
    return apiClient<AdminSubscriptionOverview>('/admin/subscriptions/overview');
  },
  adminVenues(filters: { search?: string; plan?: MenuPlanCode; status?: SubscriptionStatus } = {}) {
    return apiClient<AdminVenuesResponse>(`/admin/subscriptions/venues${toQueryString(filters)}`);
  },
  updateVenueSubscription(venueId: string, input: UpdateVenueSubscriptionInput) {
    return apiClient<{ subscription: unknown }>(`/admin/subscriptions/venues/${venueId}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  adminPlans() {
    return apiClient<AdminPlansResponse>('/admin/subscriptions/plans');
  },
  adminFeatures() {
    return apiClient<AdminFeaturesResponse>('/admin/subscriptions/features');
  },
  updatePlan(planId: string, input: UpdatePlanInput) {
    return apiClient<{ plan: unknown }>(`/admin/subscriptions/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  updateFeature(featureId: string, input: UpdatePlanFeatureInput) {
    return apiClient<{ feature: unknown }>(`/admin/subscriptions/features/${featureId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  createMapping(input: CreatePlanFeatureMappingInput) {
    return apiClient<{ mapping: unknown }>('/admin/subscriptions/mappings', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  updateMapping(mappingId: string, input: UpdatePlanFeatureMappingInput) {
    return apiClient<{ mapping: unknown }>(`/admin/subscriptions/mappings/${mappingId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
