import { RIDER_PROFILE_STORAGE_KEY, loadCoordinatesFromStorage } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, deriveCoordinates, pickStoredValues } from '@/lib/profile/values';
import { profileToPassport } from './mappers';
import { parsePassport } from './parse';
import { PASSPORT_VERSION, type RiderPassport } from './types';

/** LocalStorage key of the guest's passport. */
export const PASSPORT_STORAGE_KEY = 'baik_rider_passport';

interface Envelope {
  version: number;
  savedAt: string;
  passport: RiderPassport;
}

export interface LoadedPassport {
  passport: RiderPassport;
  /** True when the passport was built from the profile that earlier versions of the app stored. */
  fromLegacy: boolean;
}

function readEnvelope(): RiderPassport | null {
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Partial<Envelope> | null;
    return envelope?.version === PASSPORT_VERSION ? parsePassport(envelope.passport) : null;
  } catch {
    return null;
  }
}

/** The profile of earlier versions (`baiktime_rider_profile`) as a passport; missing fields come from the defaults. */
function readLegacy(): RiderPassport | null {
  const legacy = loadCoordinatesFromStorage();
  if (!legacy) return null;
  const values = { ...DEFAULT_PROFILE, ...pickStoredValues(legacy) };
  return parsePassport(profileToPassport(values, deriveCoordinates(values)));
}

/** The guest's passport from this browser: the current key first, then a one-time read of the legacy profile. */
export function loadLocalPassport(): LoadedPassport | null {
  if (typeof window === 'undefined') return null;
  const current = readEnvelope();
  if (current) return { passport: current, fromLegacy: false };
  const legacy = readLegacy();
  return legacy ? { passport: legacy, fromLegacy: true } : null;
}

/** Stores the passport of a guest; false when the browser storage is not available. */
export function saveLocalPassport(passport: RiderPassport): boolean {
  try {
    const envelope: Envelope = { version: PASSPORT_VERSION, savedAt: new Date().toISOString(), passport };
    window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

/** Removes the legacy profile of earlier versions (after it was moved to the new key). */
export function removeLegacyProfile(): void {
  try {
    window.localStorage.removeItem(RIDER_PROFILE_STORAGE_KEY);
  } catch {
    /* nothing to remove */
  }
}

/** Removes every copy of the passport from this browser (the data moved to the account, or the rider signed out). */
export function clearLocalPassport(): void {
  try {
    window.localStorage.removeItem(PASSPORT_STORAGE_KEY);
  } catch {
    /* nothing to remove */
  }
  removeLegacyProfile();
}
