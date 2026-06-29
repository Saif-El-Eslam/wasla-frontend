'use client';

import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { Card, PrimaryButton } from '@/components/ui/dashboard-ui';
import { FormInput } from '@/components/ui/form-input';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { CurrentUser } from '@/lib/api';
import type { PasswordFormInput, PasswordFormValues } from '@/features/settings/schemas/settings.schema';
import { SettingsPanelHeader, settingsInputClassName } from './settings-ui';

export function PasswordSettingsSection({
  form,
  mutation,
}: {
  form: UseFormReturn<PasswordFormInput, unknown, PasswordFormValues>;
  mutation: UseMutationResult<{ user: CurrentUser }, Error, PasswordFormValues>;
}) {
  const t = useTranslations('dashboard');

  return (
    <Card className="border-teal-100 bg-[#fbfefd] p-5">
      <SettingsPanelHeader icon={KeyRound} title={t('passwordReset')} body={t('passwordSettingsBody')} />
      <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput
            name="currentPassword"
            type="password"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('currentPassword')}
            className={`${settingsInputClassName} pe-11`}
          />
          <FormInput
            name="newPassword"
            type="password"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('newPassword')}
            className={`${settingsInputClassName} pe-11`}
          />
        </div>
        <PrimaryButton type="submit" loading={mutation.isPending} className="w-full sm:w-fit sm:min-w-44">
          <KeyRound className="size-4" />
          {t('updatePassword')}
        </PrimaryButton>
        {mutation.error ? <p className="text-sm text-red-700">{readError(mutation.error)}</p> : null}
      </form>
    </Card>
  );
}
