import { validCreds, type IntervalsCreds } from './api';

/** LocalStorage key of the Intervals.icu key. It lives only in this browser and goes only to Intervals.icu. */
export const INTERVALS_KEY_STORAGE = 'baik_intervals_key';

export function loadCreds(): IntervalsCreds | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = JSON.parse(window.localStorage.getItem(INTERVALS_KEY_STORAGE) ?? 'null') as Partial<IntervalsCreds> | null;
    const creds = { athleteId: String(raw?.athleteId ?? ''), key: String(raw?.key ?? '') };
    return validCreds(creds) ? creds : null;
  } catch {
    return null;
  }
}

export function saveCreds(creds: IntervalsCreds): boolean {
  try {
    window.localStorage.setItem(INTERVALS_KEY_STORAGE, JSON.stringify(creds));
    return true;
  } catch {
    return false;
  }
}

export function forgetCreds(): void {
  try {
    window.localStorage.removeItem(INTERVALS_KEY_STORAGE);
  } catch {
    /* nothing stored, or the storage is not available */
  }
}
