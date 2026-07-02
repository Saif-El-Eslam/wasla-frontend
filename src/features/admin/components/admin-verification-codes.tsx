'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clipboard,
  Clock3,
  KeyRound,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card, cx } from '@/components/ui/dashboard-ui';
import { toast } from '@/components/ui/toast-store';
import type {
  AdminVerificationCodeStatus,
  AdminVerificationCodesResponse,
  AdminVerificationUser,
} from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';

type RegenerateMutation = UseMutationResult<AdminVerificationUser, Error, string>;

function statusTone(status: AdminVerificationCodeStatus | undefined) {
  if (status === 'ACTIVE') {
    return 'green' as const;
  }

  if (status === 'EXPIRED') {
    return 'amber' as const;
  }

  return 'muted' as const;
}

function StatusBadgeIcon({ status }: { status: AdminVerificationCodeStatus | undefined }) {
  if (status === 'ACTIVE') {
    return <CheckCircle2 className="size-3.5" />;
  }

  if (status === 'EXPIRED') {
    return <Clock3 className="size-3.5" />;
  }

  return <AlertTriangle className="size-3.5" />;
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof KeyRound;
}) {
  return (
    <div className="rounded-2xl border border-teal-50 bg-[#f8fafa] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-white text-primary shadow-sm">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-stone-950">{value}</p>
    </div>
  );
}

function VerificationRow({
  user,
  locale,
  mutation,
}: {
  user: AdminVerificationUser;
  locale: string;
  mutation: RegenerateMutation;
}) {
  const t = useTranslations('admin');
  const status = user.latestCode?.status ?? 'MISSING';
  const code = user.latestCode?.code;
  const venueName = user.venue ? textForLocale(user.venue.name, locale) : t('verification.noVenue');

  const copyCode = async () => {
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      toast.success(t('toasts.verificationCodeCopied'));
    } catch {
      toast.error(t('toasts.verificationCodeCopyFailed'));
    }
  };

  return (
    <tr className="align-middle">
      <td className="py-4 pe-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-teal-50 text-primary">
            <UserRound className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="max-w-56 truncate font-black text-stone-950">{user.name || user.phone}</p>
            <p className="max-w-56 truncate text-xs font-bold text-stone-400">{user.phone}</p>
            <p className="mt-1 text-xs font-black text-primary">{user.role}</p>
          </div>
        </div>
      </td>
      <td className="pe-4">
        <div className="flex min-w-0 items-center gap-2">
          <Building2 className="size-4 shrink-0 text-stone-300" />
          <div className="min-w-0">
            <p className="max-w-48 truncate text-sm font-black text-stone-700">{venueName}</p>
            <p className="max-w-48 truncate text-xs font-bold text-stone-400">
              {user.venue?.slug ?? user.email ?? t('notSet')}
            </p>
          </div>
        </div>
      </td>
      <td className="pe-4 text-xs font-bold text-stone-500">{formatDate(user.createdAt, locale)}</td>
      <td className="pe-4">
        <Badge tone={statusTone(status)}>
          <span className="inline-flex items-center gap-1">
            <StatusBadgeIcon status={status} />
            {t(`verification.status.${status}`)}
          </span>
        </Badge>
        <p className="mt-1 text-xs font-bold text-stone-400">
          {user.latestCode ? t('verification.expiresAt', { date: formatDate(user.latestCode.expiresAt, locale) }) : '-'}
        </p>
      </td>
      <td className="pe-4">
        <div className="flex items-center gap-2">
          <code
            className={cx(
              'inline-flex h-10 min-w-28 items-center justify-center rounded-xl border px-3 text-lg font-black tracking-[0.16em]',
              code
                ? 'border-teal-100 bg-teal-50 text-primary'
                : 'border-stone-100 bg-stone-50 text-xs tracking-normal text-stone-400',
            )}
          >
            {code ?? t('verification.codeUnavailable')}
          </code>
          <button
            className="inline-flex size-10 items-center justify-center rounded-xl border border-teal-100 bg-white text-stone-600 transition hover:border-primary hover:text-primary disabled:opacity-40"
            type="button"
            disabled={!code}
            onClick={() => void copyCode()}
            aria-label={t('verification.copyCode')}
            title={t('verification.copyCode')}
          >
            <Clipboard className="size-4" />
          </button>
        </div>
      </td>
      <td className="text-right">
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(user.id)}
        >
          <RefreshCw className={cx('size-4', mutation.isPending ? 'animate-spin' : '')} />
          {t('verification.regenerate')}
        </button>
      </td>
    </tr>
  );
}

export function AdminVerificationCodes({
  data,
  locale,
  search,
  onSearchChange,
  mutation,
  isLoading,
}: {
  data?: AdminVerificationCodesResponse;
  locale: string;
  search: string;
  onSearchChange: (value: string) => void;
  mutation: RegenerateMutation;
  isLoading?: boolean;
}) {
  const t = useTranslations('admin');
  const metrics = data?.metrics;
  const users = data?.users ?? [];

  return (
    <Card className="border-teal-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-950">{t('verification.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('verification.body')}</p>
        </div>
        <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-teal-100 bg-[#f8fafa] px-3 md:w-80">
          <Search className="size-4 shrink-0 text-stone-400" />
          <input
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-stone-400"
            placeholder={t('verification.searchPlaceholder')}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label={t('verification.metrics.total')} value={metrics?.total ?? 0} icon={UserRound} />
        <MetricTile label={t('verification.metrics.active')} value={metrics?.activeCodes ?? 0} icon={KeyRound} />
        <MetricTile label={t('verification.metrics.expired')} value={metrics?.expiredCodes ?? 0} icon={Clock3} />
        <MetricTile
          label={t('verification.metrics.needsCode')}
          value={(metrics?.missingCodes ?? 0) + (metrics?.hiddenCodes ?? 0)}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-teal-50">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-[#f8fafa] text-xs uppercase tracking-[0.12em] text-stone-400">
            <tr>
              <th className="px-3 py-3">{t('verification.user')}</th>
              <th>{t('verification.venue')}</th>
              <th>{t('verification.joined')}</th>
              <th>{t('verification.statusLabel')}</th>
              <th>{t('verification.currentCode')}</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {users.map((user) => (
              <VerificationRow key={user.id} user={user} locale={locale} mutation={mutation} />
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <p className="p-5 text-sm font-bold text-muted-foreground">
            {isLoading ? t('verification.loading') : t('verification.empty')}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
