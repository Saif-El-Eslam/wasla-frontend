'use client';

import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileText,
  HelpCircle,
  Phone,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/dashboard-ui';
import { SettingsPanelHeader } from './settings-ui';
import Link from 'next/link';
import { PwaInstallSection } from '@/components/shared/pwa-install-section';
import { SubscriptionSettingsPanel } from '@/features/subscription/components/subscription-settings-panel';
import { useState } from 'react';

export function SupportSettingsSection() {
  const t = useTranslations('dashboard');
  const rtl = t('dir') === 'rtl';
  const [view, setView] = useState<'main' | 'pwa' | 'subscription'>('main');

  if (view === 'pwa') {
    return (
      <Card className="border-teal-100 bg-[#fbfefd] p-5">
        <button
          type="button"
          onClick={() => setView('main')}
          className="mb-4 inline-flex h-10 items-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary"
        >
          {rtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {t('back')}
        </button>

        <PwaInstallSection />
      </Card>
    );
  }

  if (view === 'subscription') {
    return (
      <Card className="border-teal-100 bg-[#fbfefd] p-5">
        <button
          type="button"
          onClick={() => setView('main')}
          className="mb-4 inline-flex h-10 items-center gap-2 rounded-2xl border border-teal-100 bg-white px-4 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary"
        >
          {rtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
          {t('back')}
        </button>

        <SubscriptionSettingsPanel />
      </Card>
    );
  }

  return (
    <Card className="border-teal-100 bg-[#fbfefd] p-5">
      <SettingsPanelHeader icon={HelpCircle} title={t('support')} body={t('supportSettingsBody')} />

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setView('pwa')}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary"
        >
          <Smartphone className="size-4" />
          {t('installApp')}
        </button>

        <button
          type="button"
          onClick={() => setView('subscription')}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary"
        >
          <CreditCard className="size-4" />
          {t('subscriptionSettings')}
        </button>

        <Link href="/contact" target="_blank" rel="noopener noreferrer">
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary">
            <Phone className="size-4" />
            {t('contactUs')}
          </button>
        </Link>

        <Link href="/privacy" target="_blank" rel="noopener noreferrer">
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary">
            <FileText className="size-4" />
            {t('privacyPolicy')}
          </button>
        </Link>

        <span className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-50 px-3 text-sm font-black text-primary ring-1 ring-teal-100">
          <ShieldCheck className="size-4" />
          {t('accountVerified')}
        </span>
      </div>
    </Card>
  );
}
