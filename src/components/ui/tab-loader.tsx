'use client';

import { Card } from './card';

export function TabLoader({ label }: { label: string }) {
  return (
    <Card className="grid min-h-48 place-items-center text-center">
      <div>
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-teal-100 border-t-primary" />
        <p className="mt-3 text-sm font-bold text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
