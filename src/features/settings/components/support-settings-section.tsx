'use client';

import { FileText, HelpCircle, Phone, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/dashboard-ui';
import { SettingsPanelHeader } from './settings-ui';
import Link from 'next/link';

export function SupportSettingsSection() {
  const t = useTranslations('dashboard');

  return (
    <Card className="border-teal-100 bg-[#fbfefd] p-5">
      <SettingsPanelHeader icon={HelpCircle} title={t('support')} body={t('supportSettingsBody')} />
      <div className="grid gap-2 sm:grid-cols-3">
        <Link className="" href="/contact" target="_blank" rel="noopener noreferrer">
          <button className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary">
            <Phone className="size-4" />
            {t('contactUs')}
          </button>
        </Link>

        <Link className="" href="/privacy" target="_blank" rel="noopener noreferrer">
          <button className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-teal-100 bg-white px-3 text-sm font-black text-stone-700 shadow-sm transition hover:border-primary hover:text-primary">
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
