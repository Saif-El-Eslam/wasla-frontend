import type { MenuPlanCode, PlanFeatureMapping, SubscriptionStatus } from '@/lib/api/types';

export const planCodes: MenuPlanCode[] = [
  'FREE',
  'MENU_STARTER',
  'MENU_PRO',
  'MENU_MULTI_BRANCH',
  'WASLA_COMPLETE',
];

export const subscriptionStatuses: SubscriptionStatus[] = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
];

export function formatAdminMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function mappingDraft(mapping: PlanFeatureMapping) {
  if (mapping.valueBool !== null) {
    return String(mapping.valueBool);
  }

  if (mapping.valueString !== null) {
    return mapping.valueString;
  }

  if (mapping.valueInt !== null) {
    return String(mapping.valueInt);
  }

  return mapping.enabled ? 'included' : 'off';
}

export function renewalWhatsappUrl(phone?: string | null) {
  const digits = (phone ?? '').replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : undefined;
}
