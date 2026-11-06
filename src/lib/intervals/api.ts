import { toIntervalsRide, type IntervalsRide } from './activities';

export interface IntervalsCreds {
  /** `0` means the owner of the key. */
  athleteId: string;
  key: string;
}

export type IntervalsFailure = 'invalid_input' | 'unauthorized' | 'not_found' | 'rate_limited' | 'unavailable';
export type IntervalsAnswer = { ok: true; rides: IntervalsRide[] } | { ok: false; error: IntervalsFailure };
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export const INTERVALS_BASE = 'https://intervals.icu/api/v1';
const MAX_DAYS = 800;
const DAY_MS = 86_400_000;

export const validAthleteId = (value: string): boolean => /^(0|i?\d{1,12})$/.test(value);
export const validKey = (value: string): boolean => /^[A-Za-z0-9_-]{8,100}$/.test(value);
export const validCreds = (creds: IntervalsCreds): boolean => validAthleteId(creds.athleteId) && validKey(creds.key);

const failureOf = (status: number): IntervalsFailure => (status === 401 || status === 403 ? 'unauthorized' : status === 404 ? 'not_found' : status === 429 ? 'rate_limited' : 'unavailable');

/**
 * The rides of the athlete between two days, read straight from Intervals.icu by the browser (the key never goes through a bAIk server):
 * HTTP basic auth with the user name `API_KEY` and the key as the password.
 */
export async function fetchIntervalsRides(creds: IntervalsCreds, oldest: string, newest: string, fetcher: Fetcher = (url, init) => fetch(url, init)): Promise<IntervalsAnswer> {
  const after = Date.parse(oldest);
  if (!validCreds(creds) || Number.isNaN(after) || after < Date.now() - MAX_DAYS * DAY_MS || Number.isNaN(Date.parse(newest))) return { ok: false, error: 'invalid_input' };
  try {
    const query = new URLSearchParams({ oldest, newest });
    const response = await fetcher(`${INTERVALS_BASE}/athlete/${creds.athleteId}/activities?${query.toString()}`, { headers: { Authorization: `Basic ${btoa(`API_KEY:${creds.key}`)}`, Accept: 'application/json' } });
    if (!response.ok) return { ok: false, error: failureOf(response.status) };
    const data: unknown = await response.json();
    return Array.isArray(data) ? { ok: true, rides: data.map(toIntervalsRide).filter((ride): ride is IntervalsRide => ride !== null) } : { ok: false, error: 'unavailable' };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}
