'use client';

import { useEffect, useRef, useState } from 'react';

export function useThrottle<T>(value: T, interval = 500) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdatedAtRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastUpdatedAtRef.current);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (remaining <= 0) {
      lastUpdatedAtRef.current = now;
      setThrottledValue(value);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      lastUpdatedAtRef.current = Date.now();
      setThrottledValue(value);
      timeoutRef.current = null;
    }, remaining);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [interval, value]);

  return throttledValue;
}
