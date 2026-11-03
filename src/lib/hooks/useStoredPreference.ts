'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** The keys of the two preferences that the app remembers in this browser (a convenience, not part of the account). */
export const LOCALE_KEY = 'baik_locale';
export const THEME_KEY = 'baik_theme';

/** What was chosen in this tab: it also serves when the browser blocks its storage (the choice then lasts until the page is closed). */
const chosen = new Map<string, string>();
const listeners = new Set<() => void>();

function stored(key: string): string | null {
  const own = chosen.get(key);
  if (own !== undefined) return own;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

const noSubscription = () => () => undefined;

/**
 * A setting that survives a reload (language, theme). The server and the first render of the browser use the fallback, so they agree;
 * the stored value follows at once. A stored value that is not allowed is ignored. `ready` is true once the browser has taken over.
 */
export function useStoredPreference<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (value: T) => void, boolean] {
  const raw = useSyncExternalStore(subscribe, () => stored(key), () => null);
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const update = useCallback((next: T) => {
    chosen.set(key, next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      /* private window or blocked storage: the in-memory choice is kept */
    }
    listeners.forEach((listener) => listener());
  }, [key]);
  const value = raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
  return [value, update, ready];
}

/** Forgets what this tab chose (tests start every case from a clean browser). */
export function resetStoredPreferences(): void {
  chosen.clear();
  listeners.forEach((listener) => listener());
}
