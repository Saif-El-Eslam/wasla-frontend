'use client';

import { X } from 'lucide-react';
import { IconButton } from './icon-button';

export function FormPanel({
  title,
  closeLabel = 'Close',
  children,
  onClose,
  panelClassName = 'sm:max-w-3xl',
}: {
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
  onClose: () => void;
  panelClassName?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-0 sm:place-items-center sm:p-4"
      // className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <section
        className={`max-h-[92dvh] max-w-[96dvw] w-full overflow-y-auto rounded-3xl border border-border bg-white p-4 shadow-2xl sm:max-w-[92dvw] sm:rounded-3xl sm:p-5 ${panelClassName}`}
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
