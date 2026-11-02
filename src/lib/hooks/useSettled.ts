'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Calls a handler once a value has stopped changing, or at once when `flush` is called (the field is left). A date typed digit by digit
 * must not open a dialog on every digit.
 */
export function useSettled<T>(handler: (value: T) => void, delayMs = 700): { schedule: (value: T) => void; flush: () => void } {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ value: T } | null>(null);
  const latest = useRef(handler);
  useEffect(() => { latest.current = handler; });
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const held = pending.current;
    pending.current = null;
    if (held) latest.current(held.value);
  }, []);
  const schedule = useCallback((value: T) => {
    pending.current = { value };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, delayMs);
  }, [flush, delayMs]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { schedule, flush };
}
