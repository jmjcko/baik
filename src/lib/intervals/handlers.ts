import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isDay } from '@/lib/notifications/dates';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { userOf } from '@/lib/supabase/userOf';
import { fetchIntervalsRides, validCreds, type IntervalsCreds, type IntervalsFailure } from './api';
import type { IntervalsConfig } from './config';
import { deleteConnection, loadCreds, markSynced, saveConnection } from './connection';

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface Deps {
  client: SupabaseClient | null;
  config: IntervalsConfig | null;
  fetcher: Fetcher;
}

type Code = 'not_configured' | 'unauthorized' | 'not_connected' | 'invalid_input' | 'rate_limited' | 'unavailable' | 'key_rejected';

/** One rider may ask a few times in a quarter of an hour; the automatic load when the app opens needs one call per bike. */
export const intervalsLimiter = createRateLimiter({ max: 30, windowMs: 15 * 60 * 1000 });
const fail = (error: Code, status: number) => NextResponse.json({ success: false, error }, { status });
const RIDER = /^[A-Za-z0-9_-]{1,80}$/;

type Ready = { response: Response } | { userId: string; client: SupabaseClient; config: IntervalsConfig };

/** The checks every route shares: configured, signed in and within the rate limit. */
async function ready(deps: Deps, limited: boolean): Promise<Ready> {
  if (!deps.config || !deps.client) return { response: fail('not_configured', 503) };
  const userId = await userOf(deps.client);
  if (!userId) return { response: fail('unauthorized', 401) };
  if (limited && !intervalsLimiter.allow(userId)) return { response: fail('rate_limited', 429) };
  return { userId, client: deps.client, config: deps.config };
}

const bodyOf = async (request: Request): Promise<Record<string, unknown>> => {
  const body: unknown = await request.json().catch(() => null);
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
};

/** The rider and the two days of a request, or null when anything is not what it should be. */
function windowOf(body: Record<string, unknown>): { riderId: string; oldest: string; newest: string } | null {
  const { riderId, oldest, newest } = body;
  return typeof riderId === 'string' && RIDER.test(riderId) && isDay(oldest) && isDay(newest) ? { riderId, oldest, newest } : null;
}

const failureOf = (error: IntervalsFailure): Response => {
  if (error === 'unauthorized' || error === 'not_found') return fail('key_rejected', 422);
  return error === 'rate_limited' ? fail('rate_limited', 429) : error === 'invalid_input' ? fail('invalid_input', 400) : fail('unavailable', 502);
};

/** Connects: the key is tried against Intervals.icu first and stored encrypted only when it works; the rides of the window come back as summaries. */
export async function connectKey(request: Request, deps: Deps): Promise<Response> {
  const r = await ready(deps, true);
  if ('response' in r) return r.response;
  const body = await bodyOf(request);
  const window = windowOf(body);
  const creds: IntervalsCreds = { athleteId: String(body.athleteId ?? ''), key: String(body.key ?? '') };
  if (!window || !validCreds(creds)) return fail('invalid_input', 400);
  const answer = await fetchIntervalsRides(creds, window.oldest, window.newest, deps.fetcher);
  if (!answer.ok) return failureOf(answer.error);
  if (!(await saveConnection(r.client, r.userId, window.riderId, creds, r.config))) return fail('unavailable', 500);
  return NextResponse.json({ success: true, rides: answer.rides });
}

/** The rides of a rider in a window, read with the stored key; the key itself never leaves the server. */
export async function syncKey(request: Request, deps: Deps): Promise<Response> {
  const r = await ready(deps, true);
  if ('response' in r) return r.response;
  const window = windowOf(await bodyOf(request));
  if (!window) return fail('invalid_input', 400);
  const stored = await loadCreds(r.client, r.userId, window.riderId, r.config);
  if (stored.status !== 'ok') return stored.status === 'none' ? fail('not_connected', 409) : fail('unavailable', 502);
  const answer = await fetchIntervalsRides(stored.creds, window.oldest, window.newest, deps.fetcher);
  if (!answer.ok) return answer.error === 'unauthorized' ? fail('not_connected', 409) : failureOf(answer.error);
  await markSynced(r.client, r.userId, window.riderId);
  return NextResponse.json({ success: true, rides: answer.rides });
}

/** Forgets the connection of a rider: the stored key is deleted. */
export async function disconnectKey(request: Request, deps: Deps): Promise<Response> {
  const r = await ready(deps, false);
  if ('response' in r) return r.response;
  const { riderId } = await bodyOf(request);
  if (typeof riderId !== 'string' || !RIDER.test(riderId)) return fail('invalid_input', 400);
  return (await deleteConnection(r.client, r.userId, riderId)) ? NextResponse.json({ success: true }) : fail('unavailable', 500);
}
