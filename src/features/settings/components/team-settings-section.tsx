'use client';

import { Pencil, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { Badge, Card, FormPanel, PrimaryButton, cx } from '@/components/ui/dashboard-ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { FormInput } from '@/components/ui/form-input';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { BranchOption, VenueUser } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';
import type { TeamUserFormInput, TeamUserFormValues } from '@/features/settings/schemas/settings.schema';
import { SettingsPanelHeader, settingsInputClassName } from './settings-ui';

export function TeamSettingsSection({
  users,
  branches,
  form,
  mutation,
  updateBranchesMutation,
  deleteUserMutation,
  currentUserId,
  locale,
}: {
  users: VenueUser[];
  branches: BranchOption[];
  form: UseFormReturn<TeamUserFormInput, unknown, TeamUserFormValues>;
  mutation: UseMutationResult<unknown, Error, TeamUserFormValues>;
  updateBranchesMutation: UseMutationResult<unknown, Error, { userId: string; branchIds: string[] }>;
  deleteUserMutation: UseMutationResult<unknown, Error, string>;
  currentUserId: string;
  locale: string;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [assignmentUser, setAssignmentUser] = useState<VenueUser | null>(null);
  const [assignmentBranchIds, setAssignmentBranchIds] = useState<string[]>([]);
  const [deleteUser, setDeleteUser] = useState<VenueUser | null>(null);
  const selectedBranchIds = form.watch('branchIds') ?? [];
  const filteredUsers = users.filter((user) =>
    `${user.name ?? ''} ${user.phone} ${user.email ?? ''} ${user.role}`.toLowerCase().includes(userSearch.toLowerCase()),
  );
  const assignmentRequiresBranch = assignmentUser?.role === 'STAFF';
  const assignmentInvalid = assignmentRequiresBranch && assignmentBranchIds.length === 0;

  const openAssignment = (user: VenueUser) => {
    setAssignmentUser(user);
    setAssignmentBranchIds(user.branches.map((branch) => branch.id));
  };

  return (
    <div className="space-y-4">
      <Card className="border-teal-100 bg-[#fbfefd] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SettingsPanelHeader icon={Users} title={t('teamSettings')} body={t('teamSettingsBody')} />
          <PrimaryButton onClick={() => setUserFormOpen(true)} className="shrink-0">
            <UserPlus className="size-4" />
            {t('addUser')}
          </PrimaryButton>
        </div>
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${settingsInputClassName} px-10`}
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder={t('searchUsers')}
          />
        </label>
      </Card>

      {userFormOpen ? (
        <FormPanel title={t('addTeamUser')} closeLabel={commonT('close')} onClose={() => setUserFormOpen(false)} panelClassName="sm:max-w-4xl">
          <form
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(values, {
                onSuccess: () => setUserFormOpen(false),
              }),
            )}
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <FormInput name="name" register={form.register} errors={form.formState.errors} placeholder={t('userName')} className={settingsInputClassName} />
              <FormInput name="phone" type="tel" register={form.register} errors={form.formState.errors} placeholder={t('phone')} className={settingsInputClassName} />
              <FormInput name="password" type="password" register={form.register} errors={form.formState.errors} placeholder={t('temporaryPassword')} className={`${settingsInputClassName} pe-11`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {branches.map((branch) => {
                const checked = selectedBranchIds.includes(branch.id);

                return (
                  <label
                    key={branch.id}
                    className={cx(
                      'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      checked
                        ? 'border-primary bg-teal-50 text-primary shadow-sm'
                        : 'border-teal-100 bg-white text-stone-700 hover:border-primary',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        form.setValue(
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
            {form.formState.errors.branchIds?.message ? (
              <p className="mt-2 text-sm text-red-700">{String(form.formState.errors.branchIds.message)}</p>
            ) : null}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{t('assignUserToBranch')}</p>
              <PrimaryButton type="submit" loading={mutation.isPending}>
                <UserPlus className="size-4" />
                {t('addUser')}
              </PrimaryButton>
            </div>
            {mutation.error ? <p className="mt-2 text-sm text-red-700">{readError(mutation.error)}</p> : null}
          </form>
        </FormPanel>
      ) : null}

      {assignmentUser ? (
        <FormPanel
          title={t('manageUserBranches')}
          closeLabel={commonT('close')}
          onClose={() => setAssignmentUser(null)}
          panelClassName="sm:max-w-3xl"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-primary">
              {(assignmentUser.name ?? assignmentUser.phone).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-black text-stone-950">{assignmentUser.name ?? assignmentUser.phone}</p>
              <p className="text-sm font-semibold text-muted-foreground">{assignmentUser.phone}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {branches.map((branch) => {
              const checked = assignmentBranchIds.includes(branch.id);

              return (
                <label
                  key={branch.id}
                  className={cx(
                    'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    checked
                      ? 'border-primary bg-teal-50 text-primary shadow-sm'
                      : 'border-teal-100 bg-white text-stone-700 hover:border-primary',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      setAssignmentBranchIds((current) =>
                        event.target.checked
                          ? [...current, branch.id]
                          : current.filter((branchId) => branchId !== branch.id),
                      )
                    }
                  />
                  {textForLocale(branch.name, locale)}
                </label>
              );
            })}
          </div>
          {assignmentInvalid ? (
            <p className="mt-2 text-sm font-bold text-red-700">{t('branchAssignmentRequired')}</p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <PrimaryButton
              loading={updateBranchesMutation.isPending}
              disabled={assignmentInvalid}
              onClick={() =>
                updateBranchesMutation.mutate(
                  { userId: assignmentUser.id, branchIds: assignmentBranchIds },
                  { onSuccess: () => setAssignmentUser(null) },
                )
              }
            >
              <Pencil className="size-4" />
              {t('updateBranches')}
            </PrimaryButton>
          </div>
        </FormPanel>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-teal-100 bg-white/95 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-primary">
                  {(user.name ?? user.phone).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <p className="font-black text-stone-950">{user.name ?? user.phone}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  {user.email ? <p className="text-sm text-muted-foreground">{user.email}</p> : null}
                </span>
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
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {user.role !== 'OWNER' ? (
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 transition hover:border-primary hover:text-primary"
                  onClick={() => openAssignment(user)}
                >
                  <Pencil className="size-4" />
                  {t('manageBranches')}
                </button>
              ) : null}
              {user.role !== 'OWNER' && user.id !== currentUserId ? (
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:border-red-200 hover:bg-red-100"
                  onClick={() => setDeleteUser(user)}
                >
                  <Trash2 className="size-4" />
                  {t('deleteUser')}
                </button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmationModal
        open={Boolean(deleteUser)}
        setOpen={(open) => !open && setDeleteUser(null)}
        title={t('deleteUserTitle')}
        description={deleteUser ? t('deleteUserBody', { name: deleteUser.name ?? deleteUser.phone }) : undefined}
        confirmText={t('deleteUser')}
        cancelText={commonT('cancel')}
        confirmLoading={deleteUserMutation.isPending}
        onConfirm={() => {
          if (!deleteUser) {
            return;
          }

          deleteUserMutation.mutate(deleteUser.id, {
            onSuccess: () => setDeleteUser(null),
          });
        }}
      />
    </div>
  );
}
