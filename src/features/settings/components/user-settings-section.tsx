'use client';

import { CheckCircle2, UserCog } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { Badge, Card, PrimaryButton } from '@/components/ui/dashboard-ui';
import { FormInput } from '@/components/ui/form-input';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { CurrentUser } from '@/lib/api';
import type { ProfileFormInput, ProfileFormValues } from '@/features/settings/schemas/settings.schema';
import { SettingsPanelHeader, settingsInputClassName } from './settings-ui';

export function UserSettingsSection({
  me,
  form,
  mutation,
}: {
  me?: CurrentUser;
  form: UseFormReturn<ProfileFormInput, unknown, ProfileFormValues>;
  mutation: UseMutationResult<{ user: CurrentUser }, Error, ProfileFormValues>;
}) {
  const t = useTranslations('dashboard');

  return (
    <Card className="border-teal-100 bg-[#fbfefd] p-5">
      <SettingsPanelHeader icon={UserCog} title={t('userSettings')} body={t('profileSettingsBody')} />
      <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput
            name="name"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('name')}
            className={settingsInputClassName}
          />
          <FormInput
            name="phone"
            type="tel"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('phone')}
            className={settingsInputClassName}
          />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <Badge tone="muted">{t('role', { role: me?.role ?? '' })}</Badge>
          <PrimaryButton type="submit" loading={mutation.isPending} className="sm:min-w-40">
            <CheckCircle2 className="size-4" />
            {t('saveProfile')}
          </PrimaryButton>
        </div>
        {mutation.error ? <p className="text-sm text-red-700">{readError(mutation.error)}</p> : null}
      </form>
    </Card>
  );
}
