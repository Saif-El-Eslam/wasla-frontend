'use client';

import { Card } from './card';

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Card className="flex min-h-48 flex-col items-center justify-center text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-3 text-base font-bold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
    </Card>
  );
}
