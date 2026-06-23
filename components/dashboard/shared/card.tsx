'use client';

import { cx } from './cx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-2xl border border-border bg-white p-4 shadow-glass', className)}>
      {children}
    </section>
  );
}
