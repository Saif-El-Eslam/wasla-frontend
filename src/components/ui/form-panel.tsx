'use client';

import { X } from 'lucide-react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { IconButton } from './icon-button';
import { useTranslations } from 'next-intl';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { confirmDiscardChanges } from '@/lib/unsaved-changes';

export function FormPanel({
  title,
  closeLabel = 'Close',
  children,
  onClose,
  panelClassName = 'sm:max-w-3xl',
  dirty = false,
}: {
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
  onClose: () => void;
  panelClassName?: string;
  dirty?: boolean;
}) {
  const commonT = useTranslations('common');
  useUnsavedChanges(dirty);
  const requestClose = () => {
    if (confirmDiscardChanges(commonT('unsavedChangesWarning'))) onClose();
  };

  return (
    <Dialog open onClose={requestClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 grid place-items-center p-0 sm:p-4">
      <DialogPanel
        data-unsaved-changes={dirty ? 'true' : undefined}
        className={`max-h-[92dvh] max-w-[96dvw] w-full overflow-y-auto rounded-3xl border border-border bg-white p-4 shadow-2xl sm:max-w-[92dvw] sm:rounded-3xl sm:p-5 ${panelClassName}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <DialogTitle className="font-black text-stone-950">{title}</DialogTitle>
          <IconButton label={closeLabel} onClick={requestClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        {children}
      </DialogPanel>
      </div>
    </Dialog>
  );
}
