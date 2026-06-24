'use client';

import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { BranchManagement } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';

function cleanPhone(value?: string | null) {
  return value?.replace(/[^\d+]/g, '') ?? '';
}

function ActionLink({
  href,
  label,
  icon: Icon,
  className,
}: {
  href?: string;
  label: string;
  icon: typeof Phone;
  className: string;
}) {
  const content = (
    <>
      <Icon className="size-5" />
      <span className="text-[11px] font-bold">{label}</span>
    </>
  );
  const baseClassName = cx(
    'flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl text-white shadow-md transition active:scale-95',
    href ? 'hover:-translate-y-0.5 hover:shadow-lg' : 'cursor-not-allowed opacity-45',
    className,
  );

  return href ? (
    <a className={baseClassName} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
      {content}
    </a>
  ) : (
    <span className={baseClassName}>{content}</span>
  );
}

export function PublicBranchActions({ branch }: { branch?: BranchManagement }) {
  const t = useTranslations('dashboard');
  const phone = cleanPhone(branch?.phone);
  const whatsapp = cleanPhone(branch?.whatsapp);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <ActionLink
        href={whatsapp ? `https://wa.me/${whatsapp.replace(/^\+/, '')}` : undefined}
        label={t('whatsapp')}
        icon={MessageCircle}
        className="bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-200"
      />
      <ActionLink
        href={phone ? `tel:${phone}` : undefined}
        label={t('calls')}
        icon={Phone}
        className="bg-gradient-to-br from-teal-600 to-teal-800 shadow-teal-200"
      />
      <ActionLink
        href={branch?.googleMapsUrl ?? undefined}
        label={t('maps')}
        icon={Navigation}
        className="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200"
      />
    </div>
  );
}
