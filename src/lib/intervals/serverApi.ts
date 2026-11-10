import type { IntervalsRide } from './activities';
import type { IntervalsCreds, IntervalsFailure } from './api';

/** What the server of bAIk can answer about the connection of a rider (Epic 56, story 56.1). */
export type ServerFailure = IntervalsFailure | 'not_configured' | 'not_connected' | 'not_signed_in';
export type ServerAnswer = { ok: true; rides: IntervalsRide[] } | { ok: false; error: ServerFailure };

/** The code of the server as a code of the browser: a key that Intervals.icu refused is `unauthorized` here, a session that is missing is `not_signed_in`. */
const CODES: Record<string, ServerFailure> = {
  not_configured: 'not_configured',
  unauthorized: 'not_signed_in',
  not_connected: 'not_connected',
  invalid_input: 'invalid_input',
  rate_limited: 'rate_limited',
  key_rejected: 'unauthorized',
  unavailable: 'unavailable',
};

const isRide = (value: unknown): value is IntervalsRide => {
  if (typeof value !== 'object' || value === null) return false;
  const ride = value as Record<string, unknown>;
  return typeof ride.id === 'string' && typeof ride.date === 'string' && typeof ride.terrain === 'string' && typeof ride.km === 'number' && typeof ride.elevationM === 'number';
};

async function call(path: string, body: unknown): Promise<ServerAnswer> {
  try {
    const response = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = (await response.json()) as { success?: boolean; error?: string; rides?: unknown };
    if (json.success) return { ok: true, rides: Array.isArray(json.rides) ? json.rides.filter(isRide) : [] };
    return { ok: false, error: CODES[json.error ?? ''] ?? 'unavailable' };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

/** Sends the key to the server once: it is tried against Intervals.icu and kept encrypted in the account; the rides of the window come back. */
export const connectOnServer = (riderId: string, creds: IntervalsCreds, oldest: string, newest: string): Promise<ServerAnswer> => call('/api/intervals/connect', { riderId, ...creds, oldest, newest });

/** The rides of a rider read by the server with the stored key. */
export const syncOnServer = (riderId: string, oldest: string, newest: string): Promise<ServerAnswer> => call('/api/intervals/sync', { riderId, oldest, newest });

/** Deletes the stored key of a rider; true when it is gone. */
export async function disconnectOnServer(riderId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/intervals/disconnect', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ riderId }) });
    return ((await response.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

/** A failure of the server as a failure the cards have a text for. */
export const toFailure = (error: ServerFailure): IntervalsFailure => (error === 'not_connected' ? 'unauthorized' : error === 'not_configured' || error === 'not_signed_in' ? 'unavailable' : error);
