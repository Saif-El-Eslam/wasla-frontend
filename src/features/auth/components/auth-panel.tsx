'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/lib/api';
import { FormInput } from '@/components/ui/form-input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  authPanelSchema,
  type AuthPanelFormInput,
  type AuthPanelFormValues,
} from '@/features/auth/schemas/auth.schema';

type Mode = 'login' | 'register' | 'verify';

function readError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function AuthPanel({ mode }: { mode: Mode }) {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = params.locale ?? 'en';
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const form = useForm<AuthPanelFormInput, unknown, AuthPanelFormValues>({
    resolver: zodResolver(authPanelSchema),
    defaultValues: {
      mode,
      phone: searchParams.get('phone') ?? '',
      password: '',
      name: '',
      code: '',
    } as AuthPanelFormInput,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset({
      mode,
      phone: searchParams.get('phone') ?? '',
      password: '',
      name: '',
      code: '',
    } as AuthPanelFormInput);
  }, [mode, reset, searchParams]);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: ({ user }) => {
      router.push(user.venueId ? `/${locale}/dashboard` : `/${locale}/setup`);
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: (result) => {
      setDevOtp(result.devOtp);
      router.push(`/${locale}/verify?phone=${encodeURIComponent(result.user.phone)}`);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: api.verifyOtp,
    onSuccess: ({ user }) => {
      router.push(user.venueId ? `/${locale}/dashboard` : `/${locale}/setup`);
    },
  });

  const isRegister = mode === 'register';
  const isVerify = mode === 'verify';
  const title = isRegister ? t('createOwnerAccount') : isVerify ? t('verifyPhone') : t('welcomeBack');
  const subtitle = isRegister
    ? t('registerSubtitle')
    : isVerify
      ? t('verifySubtitle')
      : t('loginSubtitle');
  const error = loginMutation.error ?? registerMutation.error ?? verifyMutation.error;
  const pending = loginMutation.isPending || registerMutation.isPending || verifyMutation.isPending;
  const onSubmit = (values: AuthPanelFormValues) => {
    if (values.mode === 'register') {
      registerMutation.mutate({ name: values.name, phone: values.phone, password: values.password });
      return;
    }

    if (values.mode === 'verify') {
      verifyMutation.mutate({ phone: values.phone, code: values.code });
      return;
    }

    loginMutation.mutate({ phone: values.phone, password: values.password });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <section className="w-full max-w-sm rounded-lg border border-border bg-white/88 p-5 shadow-glass backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          {isRegister ? (
            <FormInput
              name="name"
              register={register}
              errors={errors}
              placeholder={t('ownerName')}
              autoComplete="name"
              className="h-11 w-full rounded-md border border-border px-3"
            />
          ) : null}

          <FormInput
            name="phone"
            type="tel"
            register={register}
            errors={errors}
            placeholder={t('phoneNumber')}
            autoComplete="tel"
            className="h-11 w-full rounded-md border border-border px-3"
          />

          {isVerify ? (
            <FormInput
              name="code"
              register={register}
              errors={errors}
              placeholder={t('verificationCode')}
              inputMode="numeric"
              className="h-11 w-full rounded-md border border-border px-3"
            />
          ) : (
            <FormInput
              name="password"
              register={register}
              errors={errors}
              placeholder={t('password')}
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="h-11 w-full rounded-md border border-border px-3"
            />
          )}

          {devOtp ? <p className="rounded-md bg-muted px-3 py-2 text-sm">{t('developmentOtp', { otp: devOtp })}</p> : null}
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{readError(error, commonT('somethingWentWrong'))}</p>
          ) : null}

          <button
            className="h-11 w-full rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-60"
            disabled={pending}
          >
            {pending ? commonT('pleaseWait') : isRegister ? t('createAccount') : isVerify ? t('verify') : commonT('continue')}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          {mode === 'login' ? <Link href={`/${locale}/register`}>{t('createAccount')}</Link> : null}
          {mode !== 'login' ? <Link href={`/${locale}/login`}>{t('backToLogin')}</Link> : null}
          {mode === 'register' ? <Link href={`/${locale}/verify`}>{t('iHaveCode')}</Link> : null}
        </div>
      </section>
    </main>
  );
}
