'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from './card';
import { PrimaryButton } from './primary-button';

export function QueryErrorState({ onRetry }: { onRetry: () => void }) {
  const commonT = useTranslations('common');

  return (
    <Card className="flex min-h-48 flex-col items-center justify-center border-amber-100 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 text-base font-black text-stone-950">{commonT('queryErrorTitle')}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{commonT('queryErrorBody')}</p>
      <PrimaryButton className="mt-4" onClick={onRetry}>
        <RotateCcw className="size-4" aria-hidden="true" />
        {commonT('retry')}
      </PrimaryButton>
    </Card>
  );
}
