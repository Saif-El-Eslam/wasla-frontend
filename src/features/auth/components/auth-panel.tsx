'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, KeyRound, LogIn, PlusCircle, ShieldCheck, Store } from 'lucide-react';
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
import { postAuthDestination } from '@/features/auth/utils/auth-redirect';
import { queryKeys } from '@/lib/api/query-keys';
import type { CurrentUser } from '@/lib/api';

type Mode = 'login' | 'register' | 'verify';

function readError(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export function AuthPanel({ mode }: { mode: Mode }) {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const appT = useTranslations('app');
  const publicT = useTranslations('public');
  const dashboardT = useTranslations('dashboard');
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = params.locale ?? 'en';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const phoneParam = searchParams.get('phone');
  const languageHref = `/${nextLocale}/${mode}${phoneParam ? `?phone=${encodeURIComponent(phoneParam)}` : ''}`;
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

  const completeAuth = (user: CurrentUser) => {
    queryClient.setQueryData(queryKeys.me, user);
    router.replace(postAuthDestination(user, locale));
    router.refresh();
  };

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
      completeAuth(user);
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
      completeAuth(user);
    },
  });

  const isRegister = mode === 'register';
  const isVerify = mode === 'verify';
  const title = isRegister ? t('createOwnerAccount') : isVerify ? t('verifyPhone') : t('welcomeBack');
  const subtitle = isRegister ? t('registerSubtitle') : isVerify ? t('verifySubtitle') : t('loginSubtitle');
  const submitLabel = isRegister ? t('createAccount') : isVerify ? t('verify') : appT('login');
  const SubmitIcon = isRegister ? PlusCircle : isVerify ? KeyRound : LogIn;
  const inputClass =
    'h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15';
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
    <main className="h-dvh max-h-dvh overflow-hidden bg-[#f8fafa] text-stone-950">
      <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 px-4 sm:px-8 lg:px-12 xl:px-16">
        <Link href={`/${locale}`} className="flex items-center gap-2 transition hover:-translate-y-0.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-black text-white shadow-lg shadow-teal-900/10 lg:bg-white lg:text-teal-700">
            W
          </div>
          <span className="text-lg font-black text-stone-950 lg:text-white">Wasla</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/venues`}
            className="hidden h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-800 shadow-sm transition hover:-translate-y-0.5 sm:inline-flex"
          >
            <Store className="size-4" />
            {publicT('browseVenues')}
          </Link>
          <Link
            href={languageHref}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-3 text-xs font-black text-stone-800 shadow-sm"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </Link>
        </div>
      </header>

      <div className="grid h-dvh max-h-dvh overflow-hidden lg:grid-cols-[0.78fr_1fr]">
        <section className="relative hidden h-dvh max-h-dvh overflow-hidden bg-[#042f2e] px-12 pb-10 pt-24 text-white lg:flex lg:flex-col lg:justify-center lg:gap-4 xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(251,191,36,0.2),transparent_24%),radial-gradient(circle_at_12%_84%,rgba(45,212,191,0.22),transparent_30%)]" />

          <div className="wasla-dashboard-card-loader relative mx-auto w-full max-w-sm rounded-2xl border border-white/14 bg-white/10 p-4 shadow-2xl shadow-teal-950/20 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-sm font-black text-teal-700">
                  W
                </div>
                <div>
                  <div className="text-sm font-black text-white">{dashboardT('venueWorkspace')}</div>
                  <div className="mt-1 text-xs font-bold text-white/60">{dashboardT('publicPreview')}</div>
                </div>
              </div>
              <div className="grid size-12 grid-cols-4 gap-1 rounded-lg bg-white p-1.5">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-[2px] ${
                      [0, 1, 4, 5, 10, 11, 14].includes(index) ? 'bg-stone-950' : 'bg-teal-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 items-end gap-2">
              {[42, 68, 54, 82].map((height, index) => (
                <span
                  key={height}
                  className="wasla-dashboard-chart-bar rounded-full bg-teal-300/90"
                  style={{ height: `${height}px`, animationDelay: `${index * 150}ms` }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="wasla-dashboard-dot size-2 rounded-full bg-amber-300" />
              <span className="h-2 flex-1 rounded-full bg-white/18" />
              <span className="h-2 w-16 rounded-full bg-white/28" />
            </div>
          </div>

          <div className="relative grid gap-3">
            {[
              [dashboardT('menusReady'), publicT('landingOwnerMenuBody')],
              [dashboardT('branchHealth'), publicT('landingOwnerBranchesBody')],
              [dashboardT('qrHub'), publicT('landingOwnerQrBody')],
            ].map(([headline, body], index) => (
              <div
                key={headline}
                className={`wasla-owner-card wasla-owner-card-${index + 1} rounded-xl border border-white/12 bg-white/10 p-4 backdrop-blur`}
              >
                <div className="text-sm font-black text-white">{headline}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/65">{body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex h-dvh max-h-dvh items-center justify-center overflow-hidden px-4 pb-4 pt-20 sm:px-8 lg:px-12 xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_12%_88%,rgba(20,184,166,0.16),transparent_28%)] lg:hidden" />

          <div className="wasla-fade-up relative w-full max-w-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                  <ShieldCheck className="size-3.5" />
                  {appT(mode)}
                </div>
                <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">{title}</h1>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200">
                <SubmitIcon className="size-5" />
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-teal-950/10">
              <form className="space-y-3 p-4 sm:p-5" onSubmit={handleSubmit(onSubmit)}>
                {isRegister ? (
                  <FormInput
                    name="name"
                    register={register}
                    errors={errors}
                    label={t('ownerName')}
                    placeholder={t('ownerName')}
                    autoComplete="name"
                    className={inputClass}
                  />
                ) : null}

                <FormInput
                  name="phone"
                  type="tel"
                  register={register}
                  errors={errors}
                  label={t('phoneNumber')}
                  placeholder={t('phoneNumber')}
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  className={inputClass}
                />

                {isVerify ? (
                  <FormInput
                    name="code"
                    register={register}
                    errors={errors}
                    label={t('verificationCode')}
                    placeholder={t('verificationCode')}
                    inputMode="numeric"
                    dir="ltr"
                    className={`${inputClass} text-center text-lg tracking-[0.18em]`}
                  />
                ) : (
                  <FormInput
                    name="password"
                    register={register}
                    errors={errors}
                    label={t('password')}
                    placeholder={t('password')}
                    type="password"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    className={`${inputClass} pe-11`}
                  />
                )}

                {devOtp ? (
                  <p className="inline-flex w-full items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                    <CheckCircle2 className="size-4 shrink-0" />
                    {t('developmentOtp', { otp: devOtp })}
                  </p>
                ) : null}
                {error ? (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {readError(error, commonT('somethingWentWrong'))}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="wasla-shimmer inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-white shadow-lg shadow-teal-950/15 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                  disabled={pending}
                >
                  {pending ? (
                    <span className="inline-flex size-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  ) : (
                    <SubmitIcon className="size-4" />
                  )}
                  {pending ? commonT('pleaseWait') : submitLabel}
                </button>
              </form>

              <div className="grid gap-2 border-t border-border bg-[#f8fafa] p-4 text-sm font-black sm:grid-cols-2 sm:p-5">
                {mode === 'login' ? (
                  <Link
                    href={`/${locale}/register`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-stone-800 shadow-sm hover:border-teal-200 hover:text-teal-700"
                  >
                    <PlusCircle className="size-4" />
                    {t('createAccount')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-stone-800 shadow-sm hover:border-teal-200 hover:text-teal-700"
                  >
                    <LogIn className="size-4" />
                    {t('backToLogin')}
                  </Link>
                )}

                {mode === 'register' ? (
                  <Link
                    href={`/${locale}/verify`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-stone-800 shadow-sm hover:border-teal-200 hover:text-teal-700"
                  >
                    <KeyRound className="size-4" />
                    {t('iHaveCode')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/venues`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-stone-800 shadow-sm hover:border-teal-200 hover:text-teal-700"
                  >
                    <ArrowRight className="size-4" />
                    {publicT('browseVenues')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
