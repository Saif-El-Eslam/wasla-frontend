'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, ApiError } from '@/api';

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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | undefined>();

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
      router.push(`/${locale}/verify?phone=${encodeURIComponent(phone)}`);
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
          onSubmit={(event) => {
            event.preventDefault();

            if (isRegister) {
              registerMutation.mutate({ name, phone, password });
              return;
            }

            if (isVerify) {
              verifyMutation.mutate({ phone, code });
              return;
            }

            loginMutation.mutate({ phone, password });
          }}
        >
          {isRegister ? (
            <input
              className="h-11 w-full rounded-md border border-border px-3"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('ownerName')}
              autoComplete="name"
            />
          ) : null}

          <input
            className="h-11 w-full rounded-md border border-border px-3"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('phoneNumber')}
            autoComplete="tel"
          />

          {isVerify ? (
            <input
              className="h-11 w-full rounded-md border border-border px-3"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t('verificationCode')}
              inputMode="numeric"
            />
          ) : (
            <input
              className="h-11 w-full rounded-md border border-border px-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('password')}
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
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
