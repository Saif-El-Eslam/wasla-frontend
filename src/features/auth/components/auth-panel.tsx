'use client';

import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  KeyRound,
  Languages,
  LogIn,
  MapPin,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
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
import { AuthSessionRedirect } from './auth-session-redirect';
import { LogoMark } from '@/components/ui/logo-mark';
import { cx } from '@/components/ui/cx';

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
    'h-12 w-full rounded-2xl border border-teal-100 bg-white px-4 text-sm font-bold text-stone-950 outline-none shadow-sm transition placeholder:text-stone-400 hover:border-teal-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const error = loginMutation.error ?? registerMutation.error ?? verifyMutation.error;
  const pending = loginMutation.isPending || registerMutation.isPending || verifyMutation.isPending;
  const modeHref = (targetMode: Mode) =>
    `/${locale}/${targetMode}${phoneParam ? `?phone=${encodeURIComponent(phoneParam)}` : ''}`;
  const formStats: Array<[string, string]> = isRegister
    ? [
        [dashboardT('branches'), dashboardT('branchHealth')],
        [dashboardT('menu'), dashboardT('menusReady')],
        [dashboardT('qr'), dashboardT('qrHub')],
      ]
    : isVerify
      ? [
          [t('verificationCode'), dashboardT('accountVerified')],
          [dashboardT('settings'), dashboardT('support')],
          [dashboardT('publicPreview'), dashboardT('previewDashboard')],
        ]
      : [
          [dashboardT('views'), dashboardT('analytics')],
          [dashboardT('qrScans'), dashboardT('qrHub')],
          [dashboardT('branches'), dashboardT('allBranches')],
        ];
  const dashboardMetrics: Array<[string, string, ReactNode]> = [
    [dashboardT('views'), '12.8k', <BarChart3 key="views" className="size-4 text-primary" />],
    [dashboardT('qrScans'), '4.2k', <QrCode key="scans" className="size-4 text-primary" />],
    [dashboardT('branches'), '08', <Store key="branches" className="size-4 text-primary" />],
  ];
  const ownerCards: Array<[string, string, ReactNode]> = [
    [
      dashboardT('menusReady'),
      publicT('landingOwnerMenuBody'),
      <CheckCircle2 key="menus" className="mb-3 size-4 text-amber-300" />,
    ],
    [
      dashboardT('branchHealth'),
      publicT('landingOwnerBranchesBody'),
      <Store key="branch-health" className="mb-3 size-4 text-amber-300" />,
    ],
    [
      dashboardT('analytics'),
      publicT('landingOwnerAnalyticsBody'),
      <BarChart3 key="analytics" className="mb-3 size-4 text-amber-300" />,
    ],
  ];

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
      <AuthSessionRedirect locale={locale} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.96)_0%,rgba(236,253,245,0.78)_48%,rgba(255,251,235,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(13,148,136,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <header className="relative z-40 flex min-h-16 items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-10 xl:px-14">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-2xl px-1 py-1 transition hover:-translate-y-0.5"
          aria-label="Wasla"
        >
          <LogoMark className="flex size-10 items-center justify-center bg-white text-lg font-black text-teal-700 shadow-lg shadow-teal-900/10" />
          <span className="text-lg font-black text-stone-950">Wasla</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/venues`}
            className="hidden h-10 items-center gap-2 rounded-2xl border border-teal-100 bg-white/90 px-3 text-xs font-black text-stone-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-teal-300 sm:inline-flex"
          >
            <Store className="size-4" />
            {publicT('browseVenues')}
          </Link>
          <Link
            href={languageHref}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-teal-100 bg-white/90 px-3 text-xs font-black text-stone-800 shadow-sm backdrop-blur hover:border-teal-300"
          >
            <Languages className="size-4" />
            {locale === 'ar' ? 'EN' : 'AR'}
          </Link>
        </div>
      </header>

      <div className="relative z-10 grid h-[calc(100dvh-72px)] min-h-0 gap-6 px-4 pb-4 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-10 xl:px-14">
        <section className="relative hidden h-full min-h-0 overflow-hidden rounded-[2rem] bg-[#073b39] p-6 text-white shadow-2xl shadow-teal-950/18 lg:flex lg:flex-col lg:justify-between xl:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_36%),linear-gradient(0deg,rgba(15,23,42,0.28),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:38px_38px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-black text-teal-50 backdrop-blur">
              <Sparkles className="size-3.5 text-amber-300" />
              {dashboardT('venueWorkspace')}
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight xl:text-4xl">
              {publicT('landingOwnerTitle')}
            </h2>
            {/* <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">{publicT('landingOwnerBody')}</p> */}
          </div>

          <div className="relative mt-5 grid min-h-0 flex-1 place-items-center">
            <div className="wasla-fade-up relative w-full max-w-xl">
              <div className="wasla-dashboard-card-loader mx-auto max-w-md rounded-[1.65rem] border border-white/14 bg-white/12 p-4 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="rounded-[1.25rem] bg-white p-4 text-stone-950 shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <LogoMark className="flex size-11 items-center justify-center text-sm font-black text-teal-700 shadow-sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{publicT('landingWowVenue')}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-stone-500">
                          <MapPin className="size-3.5 text-amber-600" />
                          {publicT('landingWowBranch')}
                        </p>
                      </div>
                    </div>
                    <div className="grid size-14 shrink-0 grid-cols-5 gap-0.5 rounded-xl bg-stone-950 p-1.5">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={cx(
                            'rounded-[2px]',
                            [0, 1, 3, 5, 6, 9, 11, 12, 16, 18, 20, 21, 23].includes(index)
                              ? 'bg-white'
                              : 'bg-teal-300',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {dashboardMetrics.map(([label, value, icon]) => (
                      <div key={String(label)} className="rounded-2xl border border-teal-50 bg-[#f8fafa] p-3">
                        {icon}
                        <p className="mt-3 text-lg font-black text-stone-950">{value}</p>
                        <p className="truncate text-[11px] font-bold text-stone-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      publicT('landingWowCategory1'),
                      publicT('landingWowCategory2'),
                      publicT('landingWowCategory3'),
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={cx(
                          'wasla-menu-card flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-sm',
                          index === 1 ? 'wasla-menu-card-2' : index === 2 ? 'wasla-menu-card-3' : '',
                        )}
                      >
                        <span className="size-10 rounded-xl bg-teal-50" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-stone-900">{item}</p>
                          <p className="mt-1 h-2 w-2/3 rounded-full bg-stone-100" />
                        </div>
                        <span className="h-8 w-12 rounded-xl bg-amber-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="wasla-owner-card wasla-owner-card-horizontal absolute -start-2 top-16 rounded-2xl border border-white/16 bg-white/12 px-4 py-3 text-sm font-black text-white shadow-xl backdrop-blur">
                <span className="flex items-center gap-2">
                  <QrCode className="size-4 text-amber-300" />
                  {dashboardT('qrHub')}
                </span>
              </div>
              <div className="wasla-owner-card wasla-owner-card-2 absolute -end-3 bottom-12 rounded-2xl border border-white/16 bg-white px-4 py-3 text-sm font-black text-stone-950 shadow-xl">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  {dashboardT('accountVerified')}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-3">
            {ownerCards.map(([headline, body, icon], index) => (
              <div
                key={String(headline)}
                className={cx(
                  'wasla-owner-card rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur',
                  index === 1 ? 'wasla-owner-card-2' : index === 2 ? 'wasla-owner-card-3' : '',
                )}
              >
                {icon}
                <div className="text-sm font-black text-white">{String(headline)}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/65">{body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex h-full min-h-0 items-center justify-center overflow-hidden py-2 lg:py-4">
          <div className="wasla-fade-up relative max-h-full w-full max-w-lg overflow-y-auto px-1 py-1">
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-[1.35rem] border border-teal-100 bg-white/82 p-1.5 shadow-glass backdrop-blur">
              {(['login', 'register', 'verify'] as Mode[]).map((item) => (
                <Link
                  key={item}
                  href={modeHref(item)}
                  className={cx(
                    'inline-flex h-10 items-center justify-center rounded-2xl text-xs font-black transition',
                    mode === item
                      ? 'bg-primary text-white shadow-lg shadow-teal-100'
                      : 'text-stone-500 hover:bg-teal-50 hover:text-primary',
                  )}
                >
                  {appT(item)}
                </Link>
              ))}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-2xl shadow-teal-950/12">
              <div className="border-b border-teal-50 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_56%,#fffbeb_100%)] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/82 px-3 py-1 text-xs font-black text-teal-700 shadow-sm">
                      <ShieldCheck className="size-3.5" />
                      {appT(mode)}
                    </div>
                    <h1 className="text-3xl font-black leading-tight text-stone-950 sm:text-4xl">{title}</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
                  </div>
                  <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-teal-200">
                    <SubmitIcon className="size-6" />
                  </span>
                </div>

                {/* <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {formStats.map(([label, value], index) => (
                    <div
                      key={`${label}-${value}`}
                      className={cx(
                        'rounded-2xl border border-white bg-white/78 p-3 shadow-sm',
                        index === 1 ? 'hidden sm:block' : '',
                      )}
                    >
                      <p className="text-xs font-black text-stone-400">{label}</p>
                      <p className="mt-1 truncate text-sm font-black text-stone-900">{value}</p>
                    </div>
                  ))}
                </div> */}
              </div>

              <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit(onSubmit)}>
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
                  <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {readError(error, commonT('somethingWentWrong'))}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="wasla-shimmer inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white shadow-lg shadow-teal-950/15 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
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

              <div className="grid gap-2 border-t border-teal-50 bg-[#f8fafa] p-4 text-sm font-black sm:grid-cols-2 sm:p-5">
                {mode === 'login' ? (
                  <Link
                    href={`/${locale}/register`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-stone-800 shadow-sm hover:border-teal-300 hover:text-teal-700"
                  >
                    <PlusCircle className="size-4" />
                    {t('createAccount')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/login`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-stone-800 shadow-sm hover:border-teal-300 hover:text-teal-700"
                  >
                    <LogIn className="size-4" />
                    {t('backToLogin')}
                  </Link>
                )}

                {mode === 'register' ? (
                  <Link
                    href={`/${locale}/verify`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-stone-800 shadow-sm hover:border-teal-300 hover:text-teal-700"
                  >
                    <KeyRound className="size-4" />
                    {t('iHaveCode')}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/venues`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-stone-800 shadow-sm hover:border-teal-300 hover:text-teal-700"
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
