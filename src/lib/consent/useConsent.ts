'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { CONSENT_STORAGE_KEY, decide, parseConsents, stateOf, type ConsentMap, type ConsentState } from './consentStore';
import type { ConsentPurpose } from './purposes';

const EMPTY: ConsentMap = {};
const listeners = new Set<() => void>();
let current: ConsentMap | null = null;

export function readConsents(): ConsentMap {
  if (current) return current;
  try {
    current = parseConsents(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    current = {};
  }
  return current;
}

export function writeConsents(next: ConsentMap): void {
  current = next;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private window or blocked storage: the decision lasts until the page is closed */
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** Records one decision in this browser (the sign in sync takes it to the account). */
export function decideConsent(purpose: ConsentPurpose, granted: boolean): void {
  writeConsents(decide(readConsents(), purpose, granted));
}

/** Forgets every decision of this browser: on sign out, so that the next rider of the device starts with nothing; tests start clean too. */
export function resetConsents(): void {
  current = {};
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* nothing stored, nothing to remove */
  }
  listeners.forEach((listener) => listener());
}

/** Every decision of this browser; empty on the server and on the first render, so both agree. */
export function useConsents(): ConsentMap {
  return useSyncExternalStore(subscribe, readConsents, () => EMPTY);
}

/** The decision for one purpose, and the two ways to change it. */
export function useConsent(purpose: ConsentPurpose): { state: ConsentState; grant: () => void; decline: () => void } {
  const state = stateOf(useConsents(), purpose);
  const grant = useCallback(() => decideConsent(purpose, true), [purpose]);
  const decline = useCallback(() => decideConsent(purpose, false), [purpose]);
  return { state, grant, decline };
}
