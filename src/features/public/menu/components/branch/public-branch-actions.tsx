'use client';

import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PublicAnalyticsEventType } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';

type ContactBranch = {
  phone?: string | null;
  whatsapp?: string | null;
  googleMapsUrl?: string | null;
};

function cleanPhone(value?: string | null) {
  return value?.replace(/[^\d+]/g, '') ?? '';
}

function ActionLink({
  href,
  label,
  icon: Icon,
  className,
  onClick,
}: {
  href?: string;
  label: string;
  icon: typeof Phone;
  className: string;
  onClick?: () => void;
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
    <a
      className={baseClassName}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <span className={baseClassName}>{content}</span>
  );
}

export function PublicBranchActions({
  branch,
  onIntent,
}: {
  branch?: ContactBranch;
  onIntent?: (eventType: Extract<PublicAnalyticsEventType, 'WHATSAPP_CLICK' | 'CALL_CLICK' | 'MAPS_CLICK'>) => void;
}) {
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
        onClick={() => onIntent?.('WHATSAPP_CLICK')}
      />
      <ActionLink
        href={phone ? `tel:${phone}` : undefined}
        label={t('calls')}
        icon={Phone}
        className="bg-gradient-to-br from-teal-600 to-teal-800 shadow-teal-200"
        onClick={() => onIntent?.('CALL_CLICK')}
      />
      <ActionLink
        href={branch?.googleMapsUrl ?? undefined}
        label={t('maps')}
        icon={Navigation}
        className="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200"
        onClick={() => onIntent?.('MAPS_CLICK')}
      />
    </div>
  );
}
