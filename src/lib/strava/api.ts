import type { StravaBike, StravaRide } from './activities';

export type StravaFailure = 'not_configured' | 'unauthorized' | 'not_connected' | 'invalid_input' | 'rate_limited' | 'unavailable';
export type Answer<T> = ({ ok: true } & T) | { ok: false; error: StravaFailure };

const FAILURES: readonly StravaFailure[] = ['not_configured', 'unauthorized', 'not_connected', 'invalid_input', 'rate_limited', 'unavailable'];

async function call<T>(path: string, init?: RequestInit): Promise<Answer<T>> {
  try {
    const response = await fetch(path, { credentials: 'same-origin', ...init });
    const json = (await response.json()) as { success?: boolean; error?: string } & T;
    if (json.success) return { ...json, ok: true };
    return { ok: false, error: FAILURES.find((failure) => failure === json.error) ?? 'unavailable' };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

export const fetchStravaBikes = () => call<{ bikes: StravaBike[] }>('/api/strava/bikes');

export const fetchStravaRides = (gearId: string, since: string) =>
  call<{ rides: StravaRide[]; truncated: boolean }>('/api/strava/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gearId, since }) });

export const disconnectStrava = () => call<Record<string, never>>('/api/strava/disconnect', { method: 'POST' });
