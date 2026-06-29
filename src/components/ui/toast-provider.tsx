'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cx } from './cx';
import { subscribeToToasts, type ToastMessage } from './toast-store';

const toastLifetimeMs = 4200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
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
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:end-4 sm:top-4 sm:w-[360px]">
        {messages.map((message) => {
          const Icon = icons[message.tone];

          return (
            <div
              key={message.id}
              className={cx(
                'pointer-events-auto flex min-h-14 items-start gap-3 rounded-2xl border bg-white/95 p-3 text-stone-950 shadow-2xl shadow-stone-200/70 backdrop-blur',
                message.tone === 'success' && 'border-emerald-100',
                message.tone === 'error' && 'border-red-100',
                message.tone === 'info' && 'border-teal-100',
              )}
              role="status"
            >
              <span
                className={cx(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                  message.tone === 'success' && 'bg-emerald-50 text-emerald-700',
                  message.tone === 'error' && 'bg-red-50 text-red-700',
                  message.tone === 'info' && 'bg-teal-50 text-teal-700',
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
                aria-label="Dismiss notification"
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
