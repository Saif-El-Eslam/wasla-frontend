'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, HelpCircle, KeyRound, Phone, Search, ShieldCheck, Store, UserCog, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Badge, Card, FormPanel, PrimaryButton, SectionTitle, cx } from '@/components/ui/dashboard-ui';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import { FormInput } from '@/components/ui/form-input';
import { useMe } from '@/features/auth/hooks/use-me';
import { useBranchOptions, useUsers, useVenue } from '@/features/venue/hooks/use-venue';
import { invalidateVenueUsersCache, setCurrentUserInCache } from '@/features/users/cache/user-cache';
import { textForLocale } from '@/lib/localized-text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  passwordSchema,
  profileSchema,
  teamUserSchema,
  type PasswordFormInput,
  type PasswordFormValues,
  type ProfileFormInput,
  type ProfileFormValues,
  type TeamUserFormInput,
  type TeamUserFormValues,
} from '@/features/settings/schemas/settings.schema';

export function SettingsTab({
  isAdmin,
  me,
  locale,
}: {
  isAdmin: boolean;
  me: ReturnType<typeof useMe>;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'user' | 'password' | 'venue' | 'team' | 'support'>('user');
  const venue = useVenue();
  const branchesQuery = useBranchOptions(isAdmin);
  const usersQuery = useUsers({
    paginate: true,
    page: 1,
    limit: 50,
    enabled: isAdmin && activeSettingsTab === 'team',
  });
  const branches = branchesQuery.data?.branches ?? [];
  const users = usersQuery.data?.users ?? [];
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
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
  const selectedBranchIds = teamUserForm.watch('branchIds') ?? [];
  const settingsTabs = [
    { id: 'user' as const, label: t('user'), show: true },
    { id: 'password' as const, label: t('password'), show: true },
    { id: 'venue' as const, label: t('venue'), show: isAdmin },
    { id: 'team' as const, label: t('team'), show: isAdmin },
    { id: 'support' as const, label: t('support'), show: true },
  ].filter((tab) => tab.show);
  const filteredUsers = users.filter((user) =>
    `${user.name ?? ''} ${user.phone} ${user.email ?? ''} ${user.role}`.toLowerCase().includes(userSearch.toLowerCase()),
  );

  useEffect(() => {
    profileForm.reset({ name: me.data?.name ?? '', phone: me.data?.phone ?? '' });
  }, [me.data?.name, me.data?.phone, profileForm]);

  const updateMeMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => api.updateMe(values),
    onSuccess: ({ user }) => {
      setCurrentUserInCache(queryClient, user);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) => api.updatePassword(values),
    onSuccess: ({ user }) => {
      setCurrentUserInCache(queryClient, user);
      passwordForm.reset({ currentPassword: '', newPassword: '' });
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
      setUserFormOpen(false);
    },
  });

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('account')} title={t('settings')} />
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-1 shadow-glass">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            className={cx(
              'h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition',
              activeSettingsTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900',
            )}
            onClick={() => setActiveSettingsTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSettingsTab === 'user' ? (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="size-5 text-primary" />
            <h3 className="font-black text-stone-950">{t('userSettings')}</h3>
          </div>
          <form className="grid gap-2" onSubmit={profileForm.handleSubmit((values) => updateMeMutation.mutate(values))}>
            <FormInput
              name="name"
              register={profileForm.register}
              errors={profileForm.formState.errors}
              placeholder={t('name')}
            />
            <FormInput
              name="phone"
              type="tel"
              register={profileForm.register}
              errors={profileForm.formState.errors}
              placeholder={t('phone')}
            />
            <Badge tone="muted">{t('role', { role: me.data?.role ?? '' })}</Badge>
            <PrimaryButton type="submit" disabled={updateMeMutation.isPending}>
              <CheckCircle2 className="size-4" />
              {t('saveProfile')}
            </PrimaryButton>
            {updateMeMutation.error ? <p className="text-sm text-red-700">{readError(updateMeMutation.error)}</p> : null}
          </form>
        </Card>
      ) : null}

      {activeSettingsTab === 'password' ? (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            <h3 className="font-black text-stone-950">{t('passwordReset')}</h3>
          </div>
          <form className="grid gap-2" onSubmit={passwordForm.handleSubmit((values) => updatePasswordMutation.mutate(values))}>
            <FormInput name="currentPassword" type="password" register={passwordForm.register} errors={passwordForm.formState.errors} placeholder={t('currentPassword')} />
            <FormInput name="newPassword" type="password" register={passwordForm.register} errors={passwordForm.formState.errors} placeholder={t('newPassword')} />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold transition hover:border-primary hover:text-primary disabled:opacity-55" disabled={updatePasswordMutation.isPending}>
              <KeyRound className="size-4" />
              {t('updatePassword')}
            </button>
            {updatePasswordMutation.error ? <p className="text-sm text-red-700">{readError(updatePasswordMutation.error)}</p> : null}
          </form>
        </Card>
      ) : null}

      {activeSettingsTab === 'venue' && isAdmin ? (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Store className="size-5 text-primary" />
            <h3 className="font-black text-stone-950">{t('venueSettings')}</h3>
          </div>
          <div className="grid gap-2 text-sm">
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('name')} {textForLocale(venue.data?.name, locale) || commonT('notSet')}</span>
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('type')} {venue.data?.type ?? commonT('notSet')}</span>
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('currency')} {venue.data?.currency ?? 'EGP'}</span>
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('phone')} {venue.data?.phone ?? commonT('notSet')}</span>
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('whatsapp')} {venue.data?.whatsapp ?? commonT('notSet')}</span>
            <span className="rounded-xl bg-stone-50 px-3 py-2">{t('address')} {textForLocale(venue.data?.address, locale) || commonT('notSet')}</span>
          </div>
        </Card>
      ) : null}

      {activeSettingsTab === 'team' && isAdmin ? (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <h3 className="font-black text-stone-950">{t('teamSettings')}</h3>
              </div>
              <PrimaryButton onClick={() => setUserFormOpen(true)}>
                <UserPlus className="size-4" />
                {t('addUser')}
              </PrimaryButton>
            </div>
            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-11 w-full rounded-xl border border-border px-9 outline-none focus:border-primary" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder={t('searchUsers')} />
            </label>
          </Card>

          {userFormOpen ? (
            <FormPanel title={t('addTeamUser')} closeLabel={commonT('close')} onClose={() => setUserFormOpen(false)}>
              <form onSubmit={teamUserForm.handleSubmit((values) => createStaffMutation.mutate(values))}>
                <div className="grid gap-2 lg:grid-cols-3">
                  <FormInput name="name" register={teamUserForm.register} errors={teamUserForm.formState.errors} placeholder={t('userName')} />
                  <FormInput name="phone" type="tel" register={teamUserForm.register} errors={teamUserForm.formState.errors} placeholder={t('phone')} />
                  <FormInput name="password" type="password" register={teamUserForm.register} errors={teamUserForm.formState.errors} placeholder={t('temporaryPassword')} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {branches.map((branch) => {
                    const checked = selectedBranchIds.includes(branch.id);
                    return (
                      <label key={branch.id} className={cx('flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition', checked ? 'border-primary bg-teal-50 text-primary' : 'border-border bg-white text-stone-700 hover:border-primary')}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            teamUserForm.setValue(
                              'branchIds',
                              event.target.checked
                                ? [...selectedBranchIds, branch.id]
                                : selectedBranchIds.filter((branchId) => branchId !== branch.id),
                              { shouldDirty: true, shouldValidate: true },
                            )
                          }
                        />
                        {textForLocale(branch.name, locale)}
                      </label>
                    );
                  })}
                </div>
                {teamUserForm.formState.errors.branchIds?.message ? (
                  <p className="mt-2 text-sm text-red-700">{String(teamUserForm.formState.errors.branchIds.message)}</p>
                ) : null}
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">{t('assignUserToBranch')}</p>
                  <PrimaryButton type="submit" disabled={createStaffMutation.isPending}>
                    <UserPlus className="size-4" />
                    {t('addUser')}
                  </PrimaryButton>
                </div>
                {createStaffMutation.error ? <p className="mt-2 text-sm text-red-700">{readError(createStaffMutation.error)}</p> : null}
              </form>
            </FormPanel>
          ) : null}

          <div className="grid gap-3 xl:grid-cols-2">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-950">{user.name ?? user.phone}</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                    {user.email ? <p className="text-sm text-muted-foreground">{user.email}</p> : null}
                  </div>
                  <Badge tone="muted">{user.role}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user.branches.length > 0 ? (
                    user.branches.map((branch) => (
                      <Badge key={branch.id} tone="teal">
                        {textForLocale(branch.name, locale)}
                      </Badge>
                    ))
                  ) : (
                    <Badge tone="amber">{t('allBranches')}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {activeSettingsTab === 'support' ? (
        <Card>
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h3 className="font-black text-stone-950">{t('support')}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold transition hover:border-primary hover:text-primary">
            <Phone className="size-4" />
            {t('contactUs')}
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold transition hover:border-primary hover:text-primary">
            <FileText className="size-4" />
            {t('privacyPolicy')}
          </button>
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 text-sm font-bold text-primary">
            <ShieldCheck className="size-4" />
            {t('accountVerified')}
          </span>
        </div>
        </Card>
      ) : null}
    </div>
  );
}

