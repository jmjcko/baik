import { validCreds, type IntervalsCreds } from './api';

/** LocalStorage key of the keys of Intervals.icu, one for each rider (a map from the id of the rider). They live only in this browser and go only to Intervals.icu. */
export const INTERVALS_KEYS_STORAGE = 'baik_intervals_keys';
/** The first version kept one key for the whole browser; it is taken over by the rider of the bike that was paired with it. */
export const INTERVALS_KEY_STORAGE = 'baik_intervals_key';
/** The rider when the account has no riders yet. */
export const DEFAULT_RIDER = 'me';

type KeyMap = Record<string, IntervalsCreds>;

const read = (name: string): unknown => {
  try {
    return JSON.parse(window.localStorage.getItem(name) ?? 'null');
  } catch {
    return null;
  }
};

function credsOf(raw: unknown): IntervalsCreds | null {
  const source = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<IntervalsCreds>;
  const creds = { athleteId: String(source.athleteId ?? ''), key: String(source.key ?? '') };
  return validCreds(creds) ? creds : null;
}

function readMap(): KeyMap {
  const raw = read(INTERVALS_KEYS_STORAGE);
  const entries = typeof raw === 'object' && raw !== null ? Object.entries(raw as Record<string, unknown>) : [];
  return Object.fromEntries(entries.flatMap(([riderId, value]) => { const creds = credsOf(value); return creds ? [[riderId, creds]] : []; }));
}

function writeMap(map: KeyMap): boolean {
  try {
    window.localStorage.setItem(INTERVALS_KEYS_STORAGE, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * The key of a rider. With `adopt` the key of the first version (one for the whole browser) is given to this rider and moved: the caller says so only for
 * a rider with a bike that was already paired, because that key was used to pair it.
 */
export function loadCreds(riderId: string = DEFAULT_RIDER, adopt = false): IntervalsCreds | null {
  if (typeof window === 'undefined') return null;
  const own = readMap()[riderId];
  if (own) return own;
  const legacy = adopt ? credsOf(read(INTERVALS_KEY_STORAGE)) : null;
  if (!legacy) return null;
  if (writeMap({ ...readMap(), [riderId]: legacy })) window.localStorage.removeItem(INTERVALS_KEY_STORAGE);
  return legacy;
}

export const saveCreds = (creds: IntervalsCreds, riderId: string = DEFAULT_RIDER): boolean => writeMap({ ...readMap(), [riderId]: creds });

/** Forgets the key of one rider; the keys of the other riders stay. */
export function forgetCreds(riderId: string = DEFAULT_RIDER): void {
  try {
    const { [riderId]: removed, ...rest } = readMap();
    void removed;
    writeMap(rest);
  } catch {
    /* nothing stored, or the storage is not available */
  }
}
