'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SectionTitle } from '@/components/ui/dashboard-ui';
import { TabLoader } from '@/components/ui/tab-loader';
import { toast } from '@/components/ui/toast-store';
import { useMe } from '@/features/auth/hooks/use-me';
import {
  passwordSchema,
  profileSchema,
  teamUserSchema,
  venueSettingsSchema,
  type PasswordFormInput,
  type PasswordFormValues,
  type ProfileFormInput,
  type ProfileFormValues,
  type TeamUserFormInput,
  type TeamUserFormValues,
  type VenueSettingsFormInput,
  type VenueSettingsFormValues,
} from '@/features/settings/schemas/settings.schema';
import { invalidateVenueUsersCache, setCurrentUserInCache } from '@/features/users/cache/user-cache';
import { useBranchOptions, useUsers, useVenue } from '@/features/venue/hooks/use-venue';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';
import type { LocalizedValue, Venue } from '@/lib/api';
import { SubscriptionSettingsPanel } from '@/features/subscription/components/subscription-settings-panel';
import { PasswordSettingsSection } from './password-settings-section';
import { SettingsOverviewCard } from './settings-overview-card';
import { SettingsTabs, type SettingsTabId } from './settings-tabs';
import { SupportSettingsSection } from './support-settings-section';
import { TeamSettingsSection } from './team-settings-section';
import { UserSettingsSection } from './user-settings-section';
import { VenueSettingsSection } from './venue-settings-section';

function localizedDraft(value: LocalizedValue | null | undefined, locale: string) {
  if (!value) {
    return { en: '', ar: '' };
  }

  if (typeof value === 'string') {
    return locale === 'ar' ? { en: '', ar: value } : { en: value, ar: '' };
  }

  return {
    en: value.en ?? '',
    ar: value.ar ?? '',
  };
}

function venueDefaults(venue: Venue | undefined, locale: string): VenueSettingsFormInput {
  return {
    type: (venue?.type as VenueSettingsFormInput['type']) ?? 'RESTAURANT',
    name: localizedDraft(venue?.name, locale),
    description: localizedDraft(venue?.description, locale),
    address: localizedDraft(venue?.address, locale),
    defaultLocale: venue?.defaultLocale === 'en' ? 'en' : 'ar',
    logoUrl: venue?.logoUrl ?? '',
    coverUrl: venue?.coverUrl ?? '',
    phone: venue?.phone ?? '',
    whatsapp: venue?.whatsapp ?? '',
    googleMapsUrl: venue?.googleMapsUrl ?? '',
    instagramUrl: venue?.instagramUrl ?? '',
  };
}

const validSettingsTabs: SettingsTabId[] = ['user', 'password', 'venue', 'team', 'subscription', 'support'];

export function SettingsTab({
  isAdmin,
  me,
  locale,
  onLogout,
  logoutPending,
}: {
  isAdmin: boolean;
  me: ReturnType<typeof useMe>;
  locale: string;
  onLogout: () => void;
  logoutPending: boolean;
}) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSettingsTab = searchParams.get('settings') as SettingsTabId | null;
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTabId>(
    requestedSettingsTab && validSettingsTabs.includes(requestedSettingsTab) ? requestedSettingsTab : 'user',
  );
  const [showMobileSettingsMenu, setShowMobileSettingsMenu] = useState(
    !(requestedSettingsTab && validSettingsTabs.includes(requestedSettingsTab)),
  );
  const venue = useVenue();
  const branchesQuery = useBranchOptions(isAdmin);
  const usersQuery = useUsers({
    paginate: true,
    page: 1,
    limit: 50,
    enabled: isAdmin, // && activeSettingsTab === 'team',
  });
  const branches = branchesQuery.data?.branches ?? [];
  const users = usersQuery.data?.users ?? [];

  const profileForm = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: me.data?.name ?? '', phone: me.data?.phone ?? '' },
  });
  const passwordForm = useForm<PasswordFormInput, unknown, PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });
  const teamUserForm = useForm<TeamUserFormInput, unknown, TeamUserFormValues>({
    resolver: zodResolver(teamUserSchema),
    defaultValues: { name: '', phone: '', password: '', branchIds: [] },
  });
  const venueForm = useForm<VenueSettingsFormInput, unknown, VenueSettingsFormValues>({
    resolver: zodResolver(venueSettingsSchema),
    defaultValues: venueDefaults(venue.data, locale),
  });

  useEffect(() => {
    profileForm.reset({ name: me.data?.name ?? '', phone: me.data?.phone ?? '' });
  }, [me.data?.name, me.data?.phone, profileForm]);

  useEffect(() => {
    venueForm.reset(venueDefaults(venue.data, locale));
  }, [locale, venue.data, venueForm]);

  useEffect(() => {
    if (requestedSettingsTab && validSettingsTabs.includes(requestedSettingsTab)) {
      setActiveSettingsTab(requestedSettingsTab);
      setShowMobileSettingsMenu(false);
    } else {
      setShowMobileSettingsMenu(true);
    }
  }, [requestedSettingsTab, validSettingsTabs]);

  const changeSettingsTab = (tab: SettingsTabId) => {
    setActiveSettingsTab(tab);
    setShowMobileSettingsMenu(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('tab', 'settings');
    nextParams.set('settings', tab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const returnToMobileSettingsMenu = () => {
    setShowMobileSettingsMenu(true);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('tab', 'settings');
    nextParams.delete('settings');
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const updateMeMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => api.updateMe(values),
    onSuccess: ({ user }) => {
      setCurrentUserInCache(queryClient, user);
      toast.success(t('profileSaved'));
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) => api.updatePassword(values),
    onSuccess: ({ user }) => {
      setCurrentUserInCache(queryClient, user);
      passwordForm.reset({ currentPassword: '', newPassword: '' });
      toast.success(t('passwordUpdated'));
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: api.updateVenue,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.venue });
      toast.success(t('venueSaved'));
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (values: TeamUserFormValues) =>
      api.createUser({
        name: values.name,
        phone: values.phone,
        password: values.password,
        role: 'STAFF',
        branchIds: values.branchIds,
      }),
    onSuccess: () => {
      invalidateVenueUsersCache(queryClient);
      teamUserForm.reset({ name: '', phone: '', password: '', branchIds: [] });
      toast.success(t('teamUserAdded'));
    },
  });

  const updateUserBranchesMutation = useMutation({
    mutationFn: ({ userId, branchIds }: { userId: string; branchIds: string[] }) =>
      api.updateUserBranches(userId, { branchIds }),
    onSuccess: () => {
      invalidateVenueUsersCache(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast.success(t('branchesUpdated'));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    onSuccess: () => {
      invalidateVenueUsersCache(queryClient);
      toast.success(t('teamUserDeleted'));
    },
  });

  if (venue.isLoading || branchesQuery.isLoading || (activeSettingsTab === 'team' && usersQuery.isLoading)) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  const activeSettingsTitle = {
    user: t('user'),
    password: t('password'),
    venue: t('venue'),
    team: t('team'),
    subscription: t('subscription'),
    support: t('support'),
  }[activeSettingsTab];

  const activeSettingsPanel =
    activeSettingsTab === 'user' ? (
      <UserSettingsSection me={me.data} form={profileForm} mutation={updateMeMutation} />
    ) : activeSettingsTab === 'password' ? (
      <PasswordSettingsSection form={passwordForm} mutation={updatePasswordMutation} />
    ) : activeSettingsTab === 'venue' && isAdmin ? (
      <VenueSettingsSection
        venue={venue.data}
        locale={locale}
        form={venueForm}
        mutation={updateVenueMutation}
      />
    ) : activeSettingsTab === 'team' && isAdmin ? (
      <TeamSettingsSection
        users={users}
        branches={branches}
        form={teamUserForm}
        mutation={createStaffMutation}
        updateBranchesMutation={updateUserBranchesMutation}
        deleteUserMutation={deleteUserMutation}
        currentUserId={me.data?.id ?? ''}
        locale={locale}
      />
    ) : activeSettingsTab === 'subscription' ? (
      <SubscriptionSettingsPanel locale={locale} />
    ) : activeSettingsTab === 'support' ? (
      <SupportSettingsSection />
    ) : null;

  return (
    <div>
      <div className="hidden space-y-5 sm:block">
        <SectionTitle eyebrow={t('account')} title={t('settings')} />
        <SettingsOverviewCard
          me={me.data}
          venue={venue.data}
          locale={locale}
          isAdmin={isAdmin}
          userCount={users.length}
        />
        <SettingsTabs activeTab={activeSettingsTab} onChange={changeSettingsTab} isAdmin={isAdmin} />
        {activeSettingsPanel}
      </div>

      <div className="space-y-4 sm:hidden">
        {showMobileSettingsMenu ? (
          <>
            <SectionTitle eyebrow={t('account')} title={t('settings')} />
            <SettingsOverviewCard
              me={me.data}
              venue={venue.data}
              locale={locale}
              isAdmin={isAdmin}
              userCount={users.length}
            />
            <SettingsTabs
              onLogout={onLogout}
              logoutPending={logoutPending}
              activeTab={activeSettingsTab}
              onChange={changeSettingsTab}
              isAdmin={isAdmin}
            />
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-primary shadow-glass"
              onClick={returnToMobileSettingsMenu}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t('back')}
            </button>
            <SectionTitle eyebrow={t('settings')} title={activeSettingsTitle} />
            {activeSettingsPanel}
          </>
        )}
      </div>
    </div>
  );
}
