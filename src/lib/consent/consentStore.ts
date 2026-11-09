import { CONSENT_PURPOSES, CONSENT_TEXT_VERSION, type ConsentPurpose } from './purposes';

/** One decision of the rider: agreed or declined, to which version of the text, and when. */
export interface ConsentEntry {
  granted: boolean;
  version: number;
  decidedAt: string;
}

export type ConsentMap = Partial<Record<ConsentPurpose, ConsentEntry>>;

/** A decision made for another version of the text does not count: the rider is asked again. */
export type ConsentState = 'granted' | 'declined' | 'unknown';

export const CONSENT_STORAGE_KEY = 'baik_consents';

export function stateOf(map: ConsentMap, purpose: ConsentPurpose): ConsentState {
  const entry = map[purpose];
  if (!entry || entry.version !== CONSENT_TEXT_VERSION[purpose]) return 'unknown';
  return entry.granted ? 'granted' : 'declined';
}

export function decide(map: ConsentMap, purpose: ConsentPurpose, granted: boolean, now: Date = new Date()): ConsentMap {
  return { ...map, [purpose]: { granted, version: CONSENT_TEXT_VERSION[purpose], decidedAt: now.toISOString() } };
}

function parseEntry(value: unknown): ConsentEntry | null {
  if (typeof value !== 'object' || value === null) return null;
  const { granted, version, decidedAt } = value as Record<string, unknown>;
  if (typeof granted !== 'boolean' || !Number.isInteger(version) || (version as number) < 1) return null;
  if (typeof decidedAt !== 'string' || Number.isNaN(Date.parse(decidedAt))) return null;
  return { granted, version: version as number, decidedAt };
}

/** The stored text of this browser, read defensively: anything that is not a known purpose with a valid decision is ignored. */
export function parseConsents(raw: string | null): ConsentMap {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== 'object' || data === null) return {};
    const map: ConsentMap = {};
    for (const purpose of CONSENT_PURPOSES) {
      const entry = parseEntry((data as Record<string, unknown>)[purpose]);
      if (entry) map[purpose] = entry;
    }
    return map;
  } catch {
    return {};
  }
}

/** The newer of two decisions wins, so a decision made in another browser is not undone by this one (and the other way round). */
export function mergeConsents(local: ConsentMap, remote: ConsentMap): ConsentMap {
  const merged: ConsentMap = {};
  for (const purpose of CONSENT_PURPOSES) {
    const a = local[purpose];
    const b = remote[purpose];
    const winner = a && b ? (Date.parse(a.decidedAt) >= Date.parse(b.decidedAt) ? a : b) : (a ?? b);
    if (winner) merged[purpose] = winner;
  }
  return merged;
}
