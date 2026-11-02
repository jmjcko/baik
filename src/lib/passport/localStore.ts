import { RIDER_PROFILE_STORAGE_KEY, loadCoordinatesFromStorage } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, deriveCoordinates, pickStoredValues } from '@/lib/profile/values';
import { profileToPassport } from './mappers';
import { parsePassport } from './parse';
import { PASSPORT_VERSION, type RiderPassport } from './types';

/** LocalStorage key of the guest's passport. */
export const PASSPORT_STORAGE_KEY = 'baik_rider_passport';

/** The version 1 document as it was stored, kept once before the first write of version 2 (Epic 43); a later release may remove it. */
export const PASSPORT_V1_BACKUP_KEY = 'baik_rider_passport_v1_backup';

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

/** Keeps the first version 1 document that is read (never overwritten, so the first backup stays the original). */
function keepV1Backup(raw: string): void {
  try {
    if (window.localStorage.getItem(PASSPORT_V1_BACKUP_KEY) === null) window.localStorage.setItem(PASSPORT_V1_BACKUP_KEY, raw);
  } catch {
    /* A full or blocked storage must not stop the migration: the passport is still read. */
  }
}

function readEnvelope(): RiderPassport | null {
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Partial<Envelope> | null;
    if (envelope?.version === 1) keepV1Backup(raw);
    return envelope?.version === PASSPORT_VERSION || envelope?.version === 1 ? parsePassport(envelope.passport) : null;
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
    window.localStorage.removeItem(PASSPORT_V1_BACKUP_KEY);
  } catch {
    /* nothing to remove */
  }
  removeLegacyProfile();
}
