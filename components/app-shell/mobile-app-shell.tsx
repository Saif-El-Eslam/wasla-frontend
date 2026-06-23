'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/api';

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  const appT = useTranslations('app');
  const dashboardT = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const queryClient = useQueryClient();
  const locale = params.locale ?? 'en';

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      queryClient.clear();
      router.push(`/${locale}/login`);
    },
  });

  return (
    <main className="min-h-dvh px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{appT('name')}</p>
              <p className="text-base font-semibold">{appT('dashboard')}</p>
            </div>
          </div>
          <button
            className="flex size-10 items-center justify-center rounded-md border border-border bg-white/80 text-muted-foreground shadow-glass transition hover:text-foreground disabled:opacity-60"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            aria-label={dashboardT('signOut')}
            title={dashboardT('signOut')}
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </main>
  );
}
