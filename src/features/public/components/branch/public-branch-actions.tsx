'use client';

import { useTranslations } from 'next-intl';
import type { PublicAnalyticsEventType } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';
import { FaWhatsapp, FaInstagram, FaFacebook, FaPhone } from 'react-icons/fa';
import { SiGooglemaps } from 'react-icons/si';
import type { IconType } from 'react-icons';

type ContactTarget = {
  phone?: string | null;
  whatsapp?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

function cleanPhone(value?: string | null) {
  return value?.replace(/[^\d+]/g, '') ?? '';
}

function linkValue(branchValue?: string | null, venueValue?: string | null) {
  return branchValue?.trim() || venueValue?.trim() || '';
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
  icon: IconType;
  className: string;
  onClick?: () => void;
}) {
  const baseClassName = cx(
    'group inline-flex size-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-200',
    'sm:h-11 sm:w-auto sm:min-w-[118px] sm:gap-2 sm:px-4',
    href ? 'hover:-translate-y-0.5 hover:shadow-md active:scale-95' : 'cursor-not-allowed opacity-40',
    className,
  );

  const content = (
    <>
      <Icon className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />

      <span className="hidden whitespace-nowrap text-sm font-semibold text-slate-700 sm:inline">{label}</span>
    </>
  );

  return href ? (
    <a
      className={baseClassName}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <span className={baseClassName} aria-label={label} title={label}>
      {content}
    </span>
  );
}

export function PublicBranchActions({
  branch,
  venue,
  onIntent,
  page = 'menu',
}: {
  branch?: ContactTarget;
  venue?: ContactTarget;
  page?: 'branches' | 'menu';
  onIntent?: (
    eventType: Extract<PublicAnalyticsEventType, 'WHATSAPP_CLICK' | 'CALL_CLICK' | 'MAPS_CLICK'>,
  ) => void;
}) {
  const t = useTranslations('dashboard');
  const phone = cleanPhone(linkValue(branch?.phone, venue?.phone));
  const whatsapp = cleanPhone(linkValue(branch?.whatsapp, venue?.whatsapp));
  const googleMapsUrl = linkValue(branch?.googleMapsUrl, venue?.googleMapsUrl);
  const instagramUrl = linkValue(branch?.instagramUrl, venue?.instagramUrl);
  const facebookUrl = linkValue(branch?.facebookUrl, venue?.facebookUrl);
  const actions = [
    {
      href: whatsapp ? `https://wa.me/${whatsapp.replace(/^\+/, '')}` : '',
      label: t('whatsapp'),
      icon: FaWhatsapp,
      className:
        'border-emerald-200 text-[#25D366] hover:border-emerald-300 hover:bg-emerald-50/70 hover:shadow-emerald-100',
      onClick: () => onIntent?.('WHATSAPP_CLICK'),
    },
    {
      href: phone ? `tel:${phone}` : '',
      label: t('calls'),
      icon: FaPhone,
      className:
        'border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50/70 hover:shadow-teal-100',
      onClick: () => onIntent?.('CALL_CLICK'),
    },
    {
      href: googleMapsUrl,
      label: t('maps'),
      icon: SiGooglemaps,
      className:
        'border-blue-200 text-blue-500 hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-blue-100',
      onClick: () => onIntent?.('MAPS_CLICK'),
    },
    {
      href: instagramUrl,
      label: t('instagram'),
      icon: FaInstagram,
      className:
        'border-rose-200 text-rose-500 hover:border-rose-300 hover:bg-rose-50/70 hover:shadow-rose-100',
    },
    {
      href: facebookUrl,
      label: t('facebook'),
      icon: FaFacebook,
      className:
        'border-blue-200 text-[#1877F2] hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-blue-100',
    },
  ].filter((action) => action.href);

  if (!actions.length) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center ${page === 'menu' ? 'justify-center' : 'justify-start'} gap-2`}
    >
      {actions.map((action) => (
        <ActionLink
          key={action.label}
          href={action.href}
          label={action.label}
          icon={action.icon}
          className={action.className}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
}
