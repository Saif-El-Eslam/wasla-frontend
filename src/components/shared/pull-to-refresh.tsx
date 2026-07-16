'use client';

import { useEffect, useRef, useState } from 'react';
import { pullDownDismissableSelector, pullDownDismissEvent } from './pull-down-action';
import { hasUnsavedChanges } from '@/lib/unsaved-changes';

const refreshThreshold = 92;
const maxPullDistance = 132;
type PullIntent = 'dismiss' | 'refresh';

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function scrollParentFor(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return document.scrollingElement ?? document.documentElement;
  }

  let element: HTMLElement | null = target;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight;

    if (canScroll) {
      return element;
    }

    element = element.parentElement;
  }

  return document.scrollingElement ?? document.documentElement;
}

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [intent, setIntent] = useState<PullIntent>('refresh');
  const startYRef = useRef(0);
  const activeRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const intentRef = useRef<PullIntent>('refresh');
  const scrollParentRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isEditableTarget(event.target)) {
        return;
      }

      const scrollParent = scrollParentFor(event.target);

      if (scrollParent.scrollTop > 0) {
        return;
      }

      startYRef.current = event.touches[0]?.clientY ?? 0;
      activeRef.current = true;
      intentRef.current = document.querySelector(pullDownDismissableSelector) ? 'dismiss' : 'refresh';
      if (intentRef.current === 'refresh' && hasUnsavedChanges()) {
        activeRef.current = false;
        return;
      }
      setIntent(intentRef.current);
      scrollParentRef.current = scrollParent;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!activeRef.current || event.touches.length !== 1 || refreshingRef.current) {
        return;
      }

      const scrollParent = scrollParentRef.current;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = currentY - startYRef.current;

      if (!scrollParent || scrollParent.scrollTop > 0 || delta <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        activeRef.current = false;
        return;
      }

      const nextDistance = Math.min(maxPullDistance, Math.round(delta * 0.55));

      if (nextDistance > 8) {
        if (event.cancelable) {
          event.preventDefault();
        }
        pullDistanceRef.current = nextDistance;
        setPullDistance(nextDistance);
      }
    };

    const onTouchEnd = () => {
      if (!activeRef.current) {
        return;
      }

      activeRef.current = false;
      scrollParentRef.current = null;

      if (pullDistanceRef.current >= refreshThreshold) {
        if (intentRef.current === 'dismiss') {
          window.dispatchEvent(new CustomEvent(pullDownDismissEvent, { cancelable: true }));
          pullDistanceRef.current = 0;
          setPullDistance(0);
          return;
        }

        refreshingRef.current = true;
        setRefreshing(true);
        pullDistanceRef.current = refreshThreshold;
        setPullDistance(refreshThreshold);
        window.location.reload();
        return;
      }

      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    const onTouchCancel = () => {
      activeRef.current = false;
      scrollParentRef.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchCancel);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);

  const visible = pullDistance > 0 || refreshing;
  const progress = Math.min(1, pullDistance / refreshThreshold);
  const dismissing = intent === 'dismiss' && !refreshing;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center pt-[max(env(safe-area-inset-top),10px)] transition-opacity duration-150"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? Math.min(28, pullDistance * 0.22) : -24}px)`,
      }}
      aria-hidden="true"
    >
      <div className="flex h-10 min-w-10 items-center justify-center rounded-full border border-teal-100 bg-white/95 px-3 text-xs font-black text-primary shadow-glass backdrop-blur">
        {dismissing ? (
          <span
            className="flex size-5 items-center justify-center text-xl leading-none text-stone-600"
            style={{
              opacity: 0.45 + progress * 0.55,
              transform: `rotate(${progress * 90}deg) scale(${0.82 + progress * 0.18})`,
            }}
          >
            &times;
          </span>
        ) : (
          <span
            className="block size-4 rounded-full border-2 border-primary/20 border-t-primary"
            style={{
              transform: `rotate(${refreshing ? 360 : progress * 270}deg)`,
              transition: refreshing ? 'transform 650ms linear' : 'transform 120ms ease-out',
            }}
          />
        )}
      </div>
    </div>
  );
}
