'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { cx } from '@/components/ui/dashboard-ui';
import { useMediaQuery } from '@/hooks/use-media-query';

const closeDragThreshold = 76;

export function MenuHubDrawer({
  open,
  title,
  hubLabel,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  hubLabel: string;
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDragging = useRef(false);
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const updateDragOffset = useCallback((value: number) => {
    dragOffsetRef.current = value;
    setDragOffset(value);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, open]);

  const canDragSheet = useCallback(
    (target: EventTarget | null) => {
      if (isDesktop) {
        return false;
      }

      const element = target instanceof Element ? target : null;
      const fromHandle = Boolean(element?.closest('[data-sheet-drag-handle="true"]'));
      // const contentAtTop = (contentRef.current?.scrollTop ?? 0) <= 0;

      return fromHandle; //|| contentAtTop;
    },
    [isDesktop],
  );

  const finishDrag = useCallback(() => {
    if (dragOffsetRef.current > closeDragThreshold) {
      onClose();
    }

    dragStartY.current = null;
    touchStartY.current = null;
    touchDragging.current = false;
    updateDragOffset(0);
  }, [onClose, updateDragOffset]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || isDesktop || !open) {
      return;
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (!canDragSheet(event.target)) {
        return;
      }

      touchStartY.current = event.touches[0]?.clientY ?? null;
      touchDragging.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY.current === null) {
        return;
      }

      const nextOffset = Math.max(
        0,
        (event.touches[0]?.clientY ?? touchStartY.current) - touchStartY.current,
      );

      if (nextOffset > 8 && canDragSheet(event.target)) {
        touchDragging.current = true;
        updateDragOffset(nextOffset);
        event.preventDefault();
      }
    };

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });
    section.addEventListener('touchend', finishDrag);
    section.addEventListener('touchcancel', finishDrag);

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', finishDrag);
      section.removeEventListener('touchcancel', finishDrag);
    };
  }, [canDragSheet, finishDrag, isDesktop, open, updateDragOffset]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!canDragSheet(event.target)) {
      return;
    }

    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (isDesktop || dragStartY.current === null) {
      return;
    }

    updateDragOffset(Math.max(0, event.clientY - dragStartY.current));
  };

  const drawerTransform =
    !isDesktop && dragOffset
      ? `translate3d(0, ${dragOffset}px, 0)`
      : open
        ? 'translate3d(0, 0, 0)'
        : isDesktop
          ? 'translate3d(100%, 0, 0)'
          : 'translate3d(0, 100%, 0)';

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 overscroll-none bg-stone-950/25 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 ease-out',
        open && 'opacity-100',
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        ref={sectionRef}
        className="fixed inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden overscroll-none rounded-t-[1.5rem] border border-stone-200 bg-[#f8fafa] shadow-2xl shadow-stone-950/20 transition-transform duration-300 ease-out will-change-transform lg:inset-x-auto lg:inset-y-0 lg:end-0 lg:h-full lg:max-h-none lg:w-[80dvw] lg:rounded-none lg:border-y-0 lg:border-e-0"
        style={{ transform: drawerTransform }}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        aria-modal="true"
        role="dialog"
        aria-label={title}
      >
        <div
          data-sheet-drag-handle="true"
          className="sticky top-0 z-10 touch-none border-b border-stone-200 bg-[#f8fafa]/95 px-4 py-3 backdrop-blur sm:px-5"
        >
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-stone-300 lg:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-black text-stone-500">
                <span className="truncate">{hubLabel}</span>
                <ChevronRight className="size-3.5 shrink-0" />
                <span className="truncate text-teal-700">{title}</span>
              </div>
              <h2 className="mt-1 truncate text-lg font-black text-stone-950">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
              aria-label={closeLabel}
              title={closeLabel}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8">
          <div className="mx-auto">{children}</div>
        </div>
      </section>
    </div>
  );
}
