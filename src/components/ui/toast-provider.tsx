'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cx } from './cx';
import { subscribeToToasts, type ToastMessage } from './toast-store';

const toastLifetimeMs = 4200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const commonT = useTranslations('common');
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToToasts((message) => {
      setMessages((current) => [message, ...current].slice(0, 4));
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== message.id));
      }, toastLifetimeMs);
    });
  }, []);

  const icons = useMemo(
    () => ({
      success: CheckCircle2,
      error: XCircle,
      info: Info,
    }),
    [],
  );

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-x-6 top-6 z-[1000] flex flex-col gap-2 sm:inset-x-auto sm:end-8 sm:top-8 sm:w-[360px]">
        {messages.map((message) => {
          const Icon = icons[message.tone];

          return (
            <div
              key={message.id}
              className={cx(
                'pointer-events-auto flex min-h-14 items-start gap-3 rounded-2xl border p-3 text-stone-950 shadow-2xl shadow-stone-200/70 backdrop-blur',
                message.tone === 'success' && 'border-emerald-100 bg-emerald-50/95',
                message.tone === 'error' && 'border-red-100 bg-red-50/95',
                message.tone === 'info' && 'border-teal-100 bg-teal-50/95',
              )}
              role="status"
            >
              <span
                className={cx(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                  message.tone === 'success' && 'bg-emerald-100 text-emerald-700',
                  message.tone === 'error' && 'bg-red-100 text-red-700',
                  message.tone === 'info' && 'bg-teal-100 text-teal-700',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black leading-5">{message.title}</span>
                {message.description ? (
                  <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted-foreground">
                    {message.description}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-50 hover:text-stone-900"
                aria-label={commonT('dismissNotification')}
                onClick={() => setMessages((current) => current.filter((item) => item.id !== message.id))}
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
