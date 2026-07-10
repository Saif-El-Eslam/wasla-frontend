'use client';

import { useEffect, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { PlusCircle, Save, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, LoadingSpinner } from '@/components/ui/dashboard-ui';
import type {
  AdminVenueSubscriptionRow,
  AdminVenuesResponse,
  MenuPlanCode,
  SubscriptionStatus,
} from '@/lib/api/types';
import { textForLocale } from '@/lib/localized-text';
import { planCodes, subscriptionStatuses } from '../../utils/admin-subscriptions';

type UpdateSubscriptionPayload = {
  venueId: string;
  plan: MenuPlanCode;
  status: SubscriptionStatus;
  currentPeriodEnds?: string | null;
  recreate?: boolean;
};

function AssignSubscriptionPanel({
  venues,
  locale,
  mutation,
}: {
  venues: AdminVenuesResponse['venues'];
  locale: string;
  mutation: UseMutationResult<unknown, Error, UpdateSubscriptionPayload>;
}) {
  const t = useTranslations('admin');
  const [venueId, setVenueId] = useState('');
  const [plan, setPlan] = useState<MenuPlanCode>('MENU_STARTER');
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [currentPeriodEnds, setCurrentPeriodEnds] = useState('');
  const selectedVenue = venues.find((venue) => venue.id === venueId);

  return (
    <form
      className="mt-4 rounded-2xl border border-teal-100 bg-[#f8fafa] p-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (!venueId) {
          return;
        }

        mutation.mutate({ venueId, plan, status, currentPeriodEnds, recreate: true });
      }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-black text-stone-950">{t('venueCrm.assignTitle')}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('venueCrm.assignBody')}</p>
        </div>
        {selectedVenue ? (
          <span className="w-fit rounded-full border border-teal-100 bg-white px-3 py-1 text-xs font-black text-primary">
            {selectedVenue.subscription ? t('venueCrm.alreadyAssigned') : t('venueCrm.unassigned')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(140px,0.7fr)_minmax(150px,0.7fr)_auto]">
        <label className="space-y-1">
          <span className="text-xs font-black text-stone-500">{t('venueCrm.assignVenue')}</span>
          <select
            className="h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700"
            value={venueId}
            onChange={(event) => setVenueId(event.target.value)}
          >
            <option value="">{t('venueCrm.chooseVenue')}</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {textForLocale(venue.name, locale)} ({venue.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-stone-500">{t('venueCrm.plan')}</span>
          <select
            className="h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700"
            value={plan}
            onChange={(event) => setPlan(event.target.value as MenuPlanCode)}
          >
            {planCodes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-stone-500">{t('venueCrm.status')}</span>
          <select
            className="h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700"
            value={status}
            onChange={(event) => setStatus(event.target.value as SubscriptionStatus)}
          >
            {subscriptionStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-black text-stone-500">{t('venueCrm.expires')}</span>
          <input
            className="h-11 w-full rounded-xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700"
            type="date"
            value={currentPeriodEnds}
            onChange={(event) => setCurrentPeriodEnds(event.target.value)}
          />
        </label>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-primary px-4 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
          type="submit"
          disabled={!venueId || mutation.isPending}
        >
          {mutation.isPending ? <LoadingSpinner /> : <PlusCircle className="size-4" />}
          {t('venueCrm.assignButton')}
        </button>
      </div>

      {venues.length === 0 ? (
        <p className="mt-3 text-xs font-bold text-muted-foreground">{t('venueCrm.assignEmpty')}</p>
      ) : null}
    </form>
  );
}

function VenueSubscriptionRow({
  venue,
  locale,
  mutation,
}: {
  venue: AdminVenueSubscriptionRow;
  locale: string;
  mutation: UseMutationResult<unknown, Error, UpdateSubscriptionPayload>;
}) {
  const t = useTranslations('admin');
  const [plan, setPlan] = useState<MenuPlanCode>(venue.subscription?.plan ?? 'FREE');
  const [status, setStatus] = useState<SubscriptionStatus>(venue.subscription?.status ?? 'ACTIVE');
  const [currentPeriodEnds, setCurrentPeriodEnds] = useState(
    venue.subscription?.currentPeriodEnds?.slice(0, 10) ?? '',
  );

  useEffect(() => {
    setPlan(venue.subscription?.plan ?? 'FREE');
    setStatus(venue.subscription?.status ?? 'ACTIVE');
    setCurrentPeriodEnds(venue.subscription?.currentPeriodEnds?.slice(0, 10) ?? '');
  }, [venue.subscription?.currentPeriodEnds, venue.subscription?.plan, venue.subscription?.status]);

  return (
    <tr className="align-middle">
      <td className="py-3 pe-4">
        <p className="max-w-56 truncate font-black text-stone-900">{textForLocale(venue.name, locale)}</p>
        <p className="max-w-56 truncate text-xs font-bold text-stone-400">{venue.slug}</p>
        <p className="mt-1 text-xs font-black text-primary">
          {venue.subscription ? t('venueCrm.currentSubscription') : t('venueCrm.noSubscription')}
        </p>
      </td>
      <td className="pe-4 font-bold text-stone-600">{venue._count.branches}</td>
      <td className="pe-4 font-bold text-stone-600">{venue._count.users}</td>
      <td className="pe-4">
        <select
          className="h-10 w-44 rounded-xl border border-teal-100 bg-white px-3 text-xs font-black text-stone-700"
          value={plan}
          onChange={(event) => setPlan(event.target.value as MenuPlanCode)}
          aria-label={t('venueCrm.plan')}
        >
          {planCodes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </td>
      <td className="pe-4">
        <select
          className="h-10 w-36 rounded-xl border border-teal-100 bg-white px-3 text-xs font-black text-stone-700"
          value={status}
          onChange={(event) => setStatus(event.target.value as SubscriptionStatus)}
          aria-label={t('venueCrm.status')}
        >
          {subscriptionStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </td>
      <td className="pe-4">
        <input
          className="h-10 w-40 rounded-xl border border-teal-100 bg-white px-3 text-xs font-black text-stone-700"
          type="date"
          value={currentPeriodEnds}
          onChange={(event) => setCurrentPeriodEnds(event.target.value)}
          aria-label={t('venueCrm.expires')}
        />
      </td>
      <td className="text-right">
        <button
          className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-teal-700 disabled:opacity-60"
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ venueId: venue.id, plan, status, currentPeriodEnds })}
          aria-label={t('venueCrm.save')}
        >
          {mutation.isPending ? <LoadingSpinner /> : <Save className="size-4" />}
        </button>
      </td>
    </tr>
  );
}

export function VenueSubscriptionManagement({
  venues,
  locale,
  search,
  onSearchChange,
  mutation,
}: {
  venues: AdminVenuesResponse['venues'];
  locale: string;
  search: string;
  onSearchChange: (value: string) => void;
  mutation: UseMutationResult<unknown, Error, UpdateSubscriptionPayload>;
}) {
  const t = useTranslations('admin');

  return (
    <Card className="border-teal-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-stone-950">{t('venueCrm.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('venueCrm.body')}</p>
        </div>
        <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-teal-100 bg-[#f8fafa] px-3 md:w-80">
          <Search className="size-4 shrink-0 text-stone-400" />
          <input
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-stone-400"
            placeholder={t('venueCrm.searchPlaceholder')}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
      <AssignSubscriptionPanel venues={venues} locale={locale} mutation={mutation} />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-teal-50">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[#f8fafa] text-xs uppercase tracking-[0.12em] text-stone-400">
            <tr>
              <th className="px-3 py-3">{t('venueCrm.venue')}</th>
              <th>{t('venueCrm.branches')}</th>
              <th>{t('venueCrm.users')}</th>
              <th>{t('venueCrm.plan')}</th>
              <th>{t('venueCrm.status')}</th>
              <th>{t('venueCrm.expires')}</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {venues.map((venue) => (
              <VenueSubscriptionRow key={venue.id} venue={venue} locale={locale} mutation={mutation} />
            ))}
          </tbody>
        </table>
        {venues.length === 0 ? (
          <p className="p-5 text-sm font-bold text-muted-foreground">{t('venueCrm.empty')}</p>
        ) : null}
      </div>
    </Card>
  );
}
