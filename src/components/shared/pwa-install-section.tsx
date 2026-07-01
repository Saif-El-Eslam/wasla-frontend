'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Download, MonitorDown, Plus, Share2, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cx } from '@/components/ui/dashboard-ui';
import { PrimaryButton } from '@/components/ui/primary-button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isStandaloneDisplay() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone)
  );
}

function detectPlatform() {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const agent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(agent)) {
    return 'ios';
  }

  if (/android/.test(agent)) {
    return 'android';
  }

  return 'desktop';
}

export function PwaInstallSection({
  variant = 'panel',
  className,
}: {
  variant?: 'landing' | 'panel';
  className?: string;
}) {
  const t = useTranslations('pwa');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    queueMicrotask(() => {
      setInstalled(isStandaloneDisplay());
      setPlatform(detectPlatform());
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const canPrompt = Boolean(installPrompt && !installed);
  const platformHint =
    platform === 'ios' ? t('iosHint') : platform === 'android' ? t('androidHint') : t('desktopHint');

  const install = async () => {
    if (!installPrompt) {
      return;
    }

    setInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstalling(false);
    setInstallPrompt(null);

    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
  };

  return (
    <section
      className={cx(
        'relative overflow-hidden',
        variant === 'landing'
          ? 'wasla-fade-up wasla-delay-1 w-full bg-[#062f2d] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-14 xl:px-20'
          : 'rounded-3xl border border-teal-100 bg-[#fbfefd] p-4 shadow-sm shadow-teal-50 sm:p-6',
        className,
      )}
    >
      {variant === 'landing' && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(251,191,36,0.22),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(45,212,191,0.22),transparent_28%)]" />
      )}

      <div
        className={cx(
          'relative mx-auto grid w-full items-center gap-8',
          variant === 'landing'
            ? 'max-w-7xl lg:grid-cols-[1fr_1.05fr] sm:gap-12 lg:gap-16'
            : 'max-w-7xl lg:grid-cols-[1fr_1.05fr]',
        )}
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 ring-1 ring-teal-100">
            <Smartphone className="size-4" />
            {t('eyebrow')}
          </div>
          <h2
            className={cx(
              'font-black leading-tight',
              variant === 'landing'
                ? 'max-w-2xl text-3xl text-white sm:text-5xl'
                : 'text-xl text-stone-950 sm:text-2xl',
            )}
          >
            {t('title')}
          </h2>

          <p
            className={cx(
              'mt-3 max-w-2xl text-sm leading-6 sm:text-base',
              variant === 'landing' ? 'text-white/75' : 'text-muted-foreground',
            )}
          >
            {t('body')}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {true && (
              <PrimaryButton
                onClick={install}
                disabled={installing}
                loading={installing}
                className="w-full min-w-[200px] sm:w-auto z-10 wasla-shimmer inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-lg shadow-teal-950/15"
              >
                <Download className="size-4" />
                {t('install')}
              </PrimaryButton>
            )}

            {installed && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="size-4" />
                {t('installed')}
              </div>
            )}

            <p
              className={cx(
                'max-w-2xl text-xs font-bold leading-5',
                variant === 'landing' ? 'text-white/70' : 'text-stone-500',
              )}
            >
              {t('secureHint')}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Share2, title: t('stepShare'), body: platformHint },
            { icon: Plus, title: t('stepAdd'), body: t('stepAddBody') },
            { icon: MonitorDown, title: t('stepLaunch'), body: t('stepLaunchBody') },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className={cx(
                'rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                variant === 'landing'
                  ? 'border-white/15 bg-white/95 shadow-black/10'
                  : 'border-teal-100 bg-white shadow-teal-50',
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-primary">
                <Icon className="size-5" />
              </span>

              <h3 className="mt-4 text-sm font-black text-stone-950">{title}</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
