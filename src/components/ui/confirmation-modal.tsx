'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { X } from 'lucide-react';
import { PrimaryButton } from './primary-button';
import { SecondaryButton } from './secondary-button';
import { IconButton } from './icon-button';

export function ConfirmationModal({
  open,
  setOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmLoading = false,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmLoading?: boolean;
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/10" />

      <div className="fixed inset-0 grid place-items-center p-4">
        <DialogPanel className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-white p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-black text-stone-950">{title}</h3>

            <IconButton label="Close" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </IconButton>
          </div>

          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <SecondaryButton onClick={() => setOpen(false)} disabled={confirmLoading}>
              {cancelText}
            </SecondaryButton>

            <PrimaryButton onClick={onConfirm} loading={confirmLoading}>
              {confirmText}
            </PrimaryButton>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
