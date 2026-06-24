'use client';

import { X } from 'lucide-react';
import { IconButton } from './icon-button';

export function FormPanel({
  title,
  closeLabel = 'Close',
  children,
  onClose,
}: {
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <section
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border bg-white p-4 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-black text-stone-950">{title}</h3>
          <IconButton label={closeLabel} onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}
