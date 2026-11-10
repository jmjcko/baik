import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isDay } from '@/lib/notifications/dates';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { userOf } from '@/lib/supabase/userOf';
import { toRide, parseBikes, type StravaRide } from './activities';
import type { StravaConfig } from './config';
import { deleteConnection, loadAccess, markSynced, saveConnection } from './connection';
import { STATE_COOKIE, authorizeUrl, exchangeCode, grantsActivities, isCode, newState, type Fetcher } from './oauth';
import { MAX_PAGES, deauthorize, fetchActivities, fetchAthlete } from './remote';

export interface Deps {
  client: SupabaseClient | null;
  config: StravaConfig | null;
  fetcher: Fetcher;
}

type Code = 'not_configured' | 'unauthorized' | 'not_connected' | 'invalid_input' | 'rate_limited' | 'unavailable';

const COOKIE_PATH = '/api/strava';
/** Strava allows 100 requests in 15 minutes for the whole app: one rider may use a few of them. */
export const stravaLimiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });
const fail = (error: Code, status: number) => NextResponse.json({ success: false, error }, { status });
const back = (request: Request, result: string) => NextResponse.redirect(new URL(`/?strava=${result}`, new URL(request.url).origin));
const cookieOf = (request: Request, name: string): string | null => request.headers.get('cookie')?.split(';').map((part) => part.trim().split('=')).find(([key]) => key === name)?.[1] ?? null;

type Ready = { response: Response } | { userId: string; client: SupabaseClient; config: StravaConfig };

/** The checks every route shares: configured, signed in and within the rate limit. */
async function ready(deps: Deps, limited: boolean): Promise<Ready> {
  if (!deps.config || !deps.client) return { response: fail('not_configured', 503) };
  const userId = await userOf(deps.client);
  if (!userId) return { response: fail('unauthorized', 401) };
  if (limited && !stravaLimiter.allow(userId)) return { response: fail('rate_limited', 429) };
  return { userId, client: deps.client, config: deps.config };
}

/** Sends the rider to Strava, with a random state in a cookie that only this route reads (protection against a forged return, OWASP A01). */
export async function startAuth(request: Request, deps: Deps): Promise<Response> {
  if (!deps.config || !deps.client) return back(request, 'not_configured');
  if (!(await userOf(deps.client))) return back(request, 'signin');
  const state = newState();
  const redirectUri = `${new URL(request.url).origin}/api/strava/callback`;
  const response = NextResponse.redirect(authorizeUrl(deps.config.clientId, redirectUri, state));
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: COOKIE_PATH, maxAge: 600 });
  return response;
}

/** The return from Strava: checks the state, exchanges the code, keeps the tokens encrypted and sends the rider back to the app. */
export async function finishAuth(request: Request, deps: Deps): Promise<Response> {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const expected = cookieOf(request, STATE_COOKIE);
  const finish = (result: string) => {
    const response = back(request, result);
    response.cookies.set(STATE_COOKIE, '', { path: COOKIE_PATH, maxAge: 0 });
    return response;
  };
  if (!deps.config || !deps.client) return finish('not_configured');
  const userId = await userOf(deps.client);
  if (!userId) return finish('signin');
  if (!state || !expected || state !== expected) return finish('error');
  const code = url.searchParams.get('code');
  if (url.searchParams.get('error') || !isCode(code)) return finish('denied');
  if (!grantsActivities(url.searchParams.get('scope'))) return finish('scope');
  const tokens = await exchangeCode(deps.config, code, deps.fetcher);
  if (!tokens) return finish('error');
  return finish((await saveConnection(deps.client, userId, tokens, url.searchParams.get('scope') ?? '', deps.config)) ? 'connected' : 'error');
}

const errorOf = (reason: 'unauthorized' | 'rate_limited' | 'unavailable') => (reason === 'rate_limited' ? fail('rate_limited', 429) : reason === 'unauthorized' ? fail('not_connected', 409) : fail('unavailable', 502));

/** The bikes of the rider's Strava account, for the pairing. */
export async function listBikes(deps: Deps): Promise<Response> {
  const r = await ready(deps, true);
  if ('response' in r) return r.response;
  const access = await loadAccess(r.client, r.userId, r.config, deps.fetcher);
  if (access.status !== 'ok') return access.status === 'none' ? fail('not_connected', 409) : fail('unavailable', 502);
  const athlete = await fetchAthlete(access.accessToken, deps.fetcher);
  return athlete.ok ? NextResponse.json({ success: true, bikes: parseBikes(athlete.data) }) : errorOf(athlete.reason);
}

const DAY_MS = 86_400_000;

/** The rides of one Strava bike since a day, as summaries only (distance, climbing, type, day): nothing else of an activity leaves the server. */
export async function syncRides(request: Request, deps: Deps): Promise<Response> {
  const r = await ready(deps, true);
  if ('response' in r) return r.response;
  const body = (await request.json().catch(() => null)) as { gearId?: unknown; since?: unknown } | null;
  const { gearId, since } = body ?? {};
  const afterMs = typeof since === 'string' && isDay(since) ? Date.parse(since) : Number.NaN;
  if (typeof gearId !== 'string' || !/^b\d+$/.test(gearId) || Number.isNaN(afterMs) || afterMs < Date.now() - 800 * DAY_MS) return fail('invalid_input', 400);
  const access = await loadAccess(r.client, r.userId, r.config, deps.fetcher);
  if (access.status !== 'ok') return access.status === 'none' ? fail('not_connected', 409) : fail('unavailable', 502);
  const activities = await fetchActivities(access.accessToken, Math.floor(afterMs / 1000), deps.fetcher);
  if (!activities.ok) return errorOf(activities.reason);
  const rides = activities.data.map(toRide).filter((ride): ride is StravaRide => ride !== null && ride.gearId === gearId);
  await markSynced(r.client, r.userId);
  return NextResponse.json({ success: true, rides, truncated: activities.data.length >= MAX_PAGES * 200 });
}

/** Disconnects: Strava is told, the stored tokens are deleted. */
export async function disconnect(deps: Deps): Promise<Response> {
  const r = await ready(deps, false);
  if ('response' in r) return r.response;
  const access = await loadAccess(r.client, r.userId, r.config, deps.fetcher);
  if (access.status === 'ok') await deauthorize(access.accessToken, deps.fetcher);
  return (await deleteConnection(r.client, r.userId)) ? NextResponse.json({ success: true }) : fail('unavailable', 500);
}
