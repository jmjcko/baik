// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { toRide, parseBikes } from '../activities';
import { readStravaConfig, type StravaConfig } from '../config';
import { decryptToken, encryptToken } from '../crypto';
import { disconnect, finishAuth, listBikes, startAuth, stravaLimiter, syncRides, type Deps } from '../handlers';
import { authorizeUrl, exchangeCode, grantsActivities, isCode, parseTokens, STATE_COOKIE, STRAVA_SCOPE } from '../oauth';

const KEY = Buffer.alloc(32, 7);
const config: StravaConfig = { clientId: '12345', clientSecret: 'secret', tokenKey: KEY };
const NOW = Math.floor(Date.now() / 1000);
const tokenJson = (over: Record<string, unknown> = {}) => ({ access_token: 'acc-1', refresh_token: 'ref-1', expires_at: NOW + 21_600, athlete: { id: 777 }, ...over });
const activity = (over: Record<string, unknown> = {}) => ({ id: 1, sport_type: 'Ride', distance: 42_300, total_elevation_gain: 512.4, start_date_local: '2026-10-20T07:15:00Z', gear_id: 'b99', trainer: false, ...over });

describe('settings', () => {
  const env = { STRAVA_CLIENT_ID: '12345', STRAVA_CLIENT_SECRET: 's', STRAVA_TOKEN_KEY: KEY.toString('base64') };
  it('should be off when anything is missing or the key is not 32 bytes', () => {
    expect(readStravaConfig(env)).not.toBeNull();
    for (const key of Object.keys(env)) expect(readStravaConfig({ ...env, [key]: '' })).toBeNull();
    expect(readStravaConfig({ ...env, STRAVA_TOKEN_KEY: Buffer.alloc(16).toString('base64') })).toBeNull();
    expect(readStravaConfig({ ...env, STRAVA_CLIENT_ID: 'abc' })).toBeNull();
  });
});

describe('token encryption', () => {
  it('should round trip, never repeat and refuse a wrong key or a changed value', () => {
    const a = encryptToken('abc', KEY);
    expect(a).not.toContain('abc');
    expect(a).not.toBe(encryptToken('abc', KEY));
    expect(decryptToken(a, KEY)).toBe('abc');
    expect(decryptToken(a, Buffer.alloc(32, 8))).toBeNull();
    expect(decryptToken(`${a.slice(0, -2)}AA`, KEY)).toBeNull();
    expect(decryptToken('plain', KEY)).toBeNull();
  });
});

describe('the OAuth steps', () => {
  it('should ask for the profile and the rides, not for private rides', () => {
    const url = new URL(authorizeUrl('12345', 'http://localhost:3001/api/strava/callback', 'st'));
    expect(url.origin + url.pathname).toBe('https://www.strava.com/oauth/authorize');
    expect(url.searchParams.get('scope')).toBe(STRAVA_SCOPE);
    expect(STRAVA_SCOPE).not.toContain('activity:read_all');
    expect(url.searchParams.get('state')).toBe('st');
  });
  it('should read the granted scope, the code and the tokens strictly', () => {
    expect(grantsActivities('read,activity:read')).toBe(true);
    expect(grantsActivities('read,profile:read_all')).toBe(false);
    expect(grantsActivities(null)).toBe(false);
    expect(isCode('a1b2c3d4e5')).toBe(true);
    expect(isCode('../../x')).toBe(false);
    expect(parseTokens(tokenJson())).toMatchObject({ accessToken: 'acc-1', athleteId: 777 });
    expect(parseTokens({ access_token: 'a' })).toBeNull();
  });
  it('should exchange a code with the secret of the server and give null on a refusal', async () => {
    let sent = '';
    const ok = await exchangeCode(config, 'code12345', async (_url, init) => { sent = String(init?.body); return Response.json(tokenJson()); });
    expect(ok?.accessToken).toBe('acc-1');
    expect(sent).toContain('grant_type=authorization_code');
    expect(sent).toContain('client_secret=secret');
    expect(await exchangeCode(config, 'code12345', async () => new Response('no', { status: 400 }))).toBeNull();
    expect(await exchangeCode(config, 'code12345', async () => { throw new Error('down'); })).toBeNull();
  });
});

describe('an activity as a ride', () => {
  it.each([['Ride', 'road'], ['GravelRide', 'gravel'], ['MountainBikeRide', 'mtb'], ['VirtualRide', 'trainer']])('should read %s as %s', (kind, terrain) => {
    expect(toRide(activity({ sport_type: kind }))?.terrain).toBe(terrain);
  });
  it('should read the trainer flag, round the numbers and keep only the summary', () => {
    const ride = toRide(activity({ trainer: true, map: { summary_polyline: 'abc' }, start_latlng: [50, 14], name: 'Home loop', athlete: { id: 1 } }));
    expect(ride).toEqual({ id: 'strava-1', date: '2026-10-20', terrain: 'trainer', km: 42.3, elevationM: 512, gearId: 'b99' });
    expect(Object.keys(ride as object).sort()).toEqual(['date', 'elevationM', 'gearId', 'id', 'km', 'terrain']);
  });
  it('should drop e-bike rides, other sports, tiny rides and broken data', () => {
    for (const bad of [activity({ sport_type: 'EBikeRide' }), activity({ sport_type: 'EMountainBikeRide' }), activity({ sport_type: 'Run' }), activity({ distance: 50 }), activity({ id: 'x' }), activity({ start_date_local: 'soon' }), null, 'x']) expect(toRide(bad)).toBeNull();
  });
  it('should list the bikes and not the shoes', () => {
    expect(parseBikes({ bikes: [{ id: 'b99', name: 'Road', distance: 12_345_000 }, { id: 'g1', name: 'Shoes', distance: 5 }, { id: 'b1' }] })).toEqual([{ id: 'b99', name: 'Road', km: 12_345 }, { id: 'b1', name: 'b1', km: 0 }]);
    expect(parseBikes(null)).toEqual([]);
  });
});

/** A Supabase client with one row of the table `strava_connections`. */
function fakeClient(userId: string | null) {
  const state = { row: null as Record<string, unknown> | null };
  const client = {
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
    from: () => ({
      upsert: async (row: Record<string, unknown>) => { state.row = row; return { error: null }; },
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: state.row, error: null }) }) }),
      update: (patch: Record<string, unknown>) => ({ eq: async () => { state.row = { ...state.row, ...patch }; return { error: null }; } }),
      delete: () => ({ eq: async () => { state.row = null; return { error: null }; } }),
    }),
  };
  return { state, client: client as unknown as SupabaseClient };
}

function fakeFetch(calls: string[] = [], pages: unknown[][] = [[activity(), activity({ id: 2, gear_id: 'b5' }), activity({ id: 3, sport_type: 'EBikeRide' })]]) {
  return async (url: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? 'GET'} ${url}`);
    if (url.includes('/oauth/token')) return Response.json(tokenJson({ access_token: 'acc-2', refresh_token: 'ref-2' }));
    if (url.includes('/oauth/deauthorize')) return Response.json({});
    if (url.includes('/athlete/activities')) return Response.json(pages[Number(new URL(url).searchParams.get('page')) - 1] ?? []);
    return Response.json({ bikes: [{ id: 'b99', name: 'Road', distance: 1_000_000 }] });
  };
}

const deps = (userId: string | null, fetcher = fakeFetch(), over: Partial<Deps> = {}): Deps & { state: ReturnType<typeof fakeClient>['state'] } => {
  const { client, state } = fakeClient(userId);
  return { client, config, fetcher, state, ...over };
};
const connected = (d: ReturnType<typeof deps>, expiresAt = NOW + 3600) => { d.state.row = { access_token_enc: encryptToken('acc-1', KEY), refresh_token_enc: encryptToken('ref-1', KEY), expires_at: new Date(expiresAt * 1000).toISOString() }; return d; };
const post = (body: unknown) => new Request('http://localhost:3001/api/strava/sync', { method: 'POST', body: JSON.stringify(body) });
const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

beforeEach(() => stravaLimiter.reset());

describe('the start of the authorisation', () => {
  const req = new Request('http://localhost:3001/api/strava/auth');
  it('should send a rider who is not set up or not signed in back to the app', async () => {
    expect((await startAuth(req, deps('u1', fakeFetch(), { config: null }))).headers.get('location')).toContain('strava=not_configured');
    expect((await startAuth(req, deps(null))).headers.get('location')).toContain('strava=signin');
  });
  it('should send the rider to Strava with a state that is also kept in a cookie only the routes can read', async () => {
    const response = await startAuth(req, deps('u1'));
    const location = new URL(response.headers.get('location') as string);
    expect(location.host).toBe('www.strava.com');
    expect(location.searchParams.get('redirect_uri')).toBe('http://localhost:3001/api/strava/callback');
    const cookie = response.headers.get('set-cookie') as string;
    expect(cookie).toContain(`${STATE_COOKIE}=${location.searchParams.get('state')}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });
});

describe('the return from Strava', () => {
  const back = (query: string, state = 'good') => new Request(`http://localhost:3001/api/strava/callback?${query}`, { headers: { cookie: `${STATE_COOKIE}=${state}` } });
  const where = (r: Response) => r.headers.get('location') as string;
  it('should refuse a state that does not match, a denial and a missing right to read the rides', async () => {
    expect(where(await finishAuth(back('code=abcdefgh12&state=other&scope=read,activity:read'), deps('u1')))).toContain('strava=error');
    expect(where(await finishAuth(back('error=access_denied&state=good'), deps('u1')))).toContain('strava=denied');
    expect(where(await finishAuth(back('code=abcdefgh12&state=good&scope=read'), deps('u1')))).toContain('strava=scope');
    expect(where(await finishAuth(new Request('http://localhost:3001/api/strava/callback?code=abcdefgh12&state=good'), deps('u1')))).toContain('strava=error');
  });
  it('should store the tokens encrypted for the signed in rider and send them back', async () => {
    const d = deps('u1');
    const response = await finishAuth(back('code=abcdefgh12&state=good&scope=read,activity:read,profile:read_all'), d);
    expect(where(response)).toContain('strava=connected');
    expect(d.state.row).toMatchObject({ user_id: 'u1', athlete_id: 777 });
    expect(JSON.stringify(d.state.row)).not.toContain('acc-2');
    expect(decryptToken(String(d.state.row?.access_token_enc), KEY)).toBe('acc-2');
    expect(response.headers.get('set-cookie')).toMatch(/Max-Age=0/i);
  });
  it('should not store anything for a guest or when Strava refuses the code', async () => {
    const guest = deps(null);
    expect(where(await finishAuth(back('code=abcdefgh12&state=good&scope=activity:read'), guest))).toContain('strava=signin');
    const refused = deps('u1', async () => new Response('no', { status: 400 }));
    expect(where(await finishAuth(back('code=abcdefgh12&state=good&scope=activity:read'), refused))).toContain('strava=error');
    expect(refused.state.row).toBeNull();
  });
});

describe('the bikes and the rides', () => {
  it('should refuse without settings, without a session and without a connection', async () => {
    expect((await listBikes(deps('u1', fakeFetch(), { config: null }))).status).toBe(503);
    expect((await listBikes(deps(null))).status).toBe(401);
    expect((await listBikes(deps('u1'))).status).toBe(409);
  });
  it('should list the bikes', async () => {
    const response = await listBikes(connected(deps('u1')));
    expect(await response.json()).toEqual({ success: true, bikes: [{ id: 'b99', name: 'Road', km: 1000 }] });
  });
  it('should renew a token that is about to expire and store the new one encrypted', async () => {
    const calls: string[] = [];
    const d = connected(deps('u1', fakeFetch(calls)), NOW + 10);
    expect((await listBikes(d)).status).toBe(200);
    expect(calls.some((call) => call.includes('/oauth/token'))).toBe(true);
    expect(decryptToken(String(d.state.row?.access_token_enc), KEY)).toBe('acc-2');
  });
  it('should return the summaries of the rides of the chosen bike only', async () => {
    const response = await syncRides(post({ gearId: 'b99', since }), connected(deps('u1')));
    const json = await response.json();
    expect(json.rides).toEqual([{ id: 'strava-1', date: '2026-10-20', terrain: 'road', km: 42.3, elevationM: 512, gearId: 'b99' }]);
    expect(json.truncated).toBe(false);
  });
  it('should refuse a bad gear id or day and a day that is too old', async () => {
    for (const body of [{ gearId: '../x', since }, { gearId: 'b99', since: 'soon' }, { gearId: 'b99', since: '2001-01-01' }, {}]) expect((await syncRides(post(body), connected(deps('u1')))).status).toBe(400);
  });
  it('should say when Strava is busy or the token was withdrawn', async () => {
    expect((await syncRides(post({ gearId: 'b99', since }), connected(deps('u1', async () => new Response('', { status: 429 }))))).status).toBe(429);
    expect((await syncRides(post({ gearId: 'b99', since }), connected(deps('u1', async () => new Response('', { status: 401 }))))).status).toBe(409);
  });
  it('should limit how often one rider may ask', async () => {
    const d = connected(deps('u1'));
    for (let i = 0; i < 10; i++) expect((await listBikes(d)).status).toBe(200);
    expect((await listBikes(d)).status).toBe(429);
  });
});

describe('the disconnect', () => {
  it('should tell Strava and delete the stored tokens', async () => {
    const calls: string[] = [];
    const d = connected(deps('u1', fakeFetch(calls)));
    expect((await disconnect(d)).status).toBe(200);
    expect(calls.some((call) => call.startsWith('POST') && call.includes('/oauth/deauthorize'))).toBe(true);
    expect(d.state.row).toBeNull();
  });
  it('should refuse a guest', async () => {
    expect((await disconnect(deps(null))).status).toBe(401);
  });
});
