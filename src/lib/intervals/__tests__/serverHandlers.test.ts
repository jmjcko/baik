// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptToken } from '@/lib/strava/crypto';
import { readIntervalsConfig, type IntervalsConfig } from '../config';
import { connectKey, disconnectKey, intervalsLimiter, syncKey, type Deps } from '../handlers';

const KEY = Buffer.alloc(32, 9);
const config: IntervalsConfig = { tokenKey: KEY };
const SECRET = 'abcdefgh12345';
const activity = (over: Record<string, unknown> = {}) => ({ id: 'i1', type: 'Ride', distance: 42_300, total_elevation_gain: 512.4, start_date_local: '2026-10-20T07:15:00', gear: { id: 'b1', name: 'Road' }, ...over });
const post = (body: unknown) => new Request('http://localhost/api/intervals/x', { method: 'POST', body: JSON.stringify(body) });
const window = { riderId: 'me', oldest: '2026-10-01', newest: '2026-11-09' };

interface Row { user_id: string; rider_id: string; athlete_id: string; key_enc: string; last_sync_at: string | null }

/** A fake Supabase client: the session is `userId`, the table `intervals_connections` is a list of rows. */
function fakeClient(userId: string | null, rows: Row[]) {
  const match = (filters: Record<string, string>) => rows.filter((row) => Object.entries(filters).every(([column, value]) => (row as unknown as Record<string, string>)[column] === value));
  const chain = (run: (filters: Record<string, string>) => unknown) => {
    const filters: Record<string, string> = {};
    const link: Record<string, unknown> = {};
    link.eq = (column: string, value: string) => { filters[column] = value; return link; };
    link.maybeSingle = async () => ({ data: match(filters)[0] ?? null, error: null });
    link.then = (resolve: (value: unknown) => void) => resolve(run(filters));
    return link;
  };
  return {
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
    from: () => ({
      upsert: async (row: Row) => { const at = rows.findIndex((one) => one.user_id === row.user_id && one.rider_id === row.rider_id); if (at >= 0) rows[at] = row; else rows.push(row); return { error: null }; },
      select: () => chain(() => ({ data: rows, error: null })),
      update: (patch: Partial<Row>) => chain((filters) => { match(filters).forEach((row) => Object.assign(row, patch)); return { error: null }; }),
      delete: () => chain((filters) => { match(filters).forEach((row) => rows.splice(rows.indexOf(row), 1)); return { error: null }; }),
    }),
  } as unknown as SupabaseClient;
}

const deps = (userId: string | null, rows: Row[], fetcher?: Deps['fetcher'], over: Partial<Deps> = {}): Deps & { rows: Row[]; urls: string[] } => {
  const urls: string[] = [];
  const answer = fetcher ?? (async (url) => (urls.push(url), Response.json([activity(), activity({ id: 'i2', type: 'Run' })])));
  return { client: fakeClient(userId, rows), config, fetcher: async (url, init) => answer(url, init), rows, urls, ...over };
};

describe('settings', () => {
  it('should be off when the variable is missing or is not 32 bytes of base64', () => {
    expect(readIntervalsConfig({ INTERVALS_TOKEN_KEY: KEY.toString('base64') })).not.toBeNull();
    expect(readIntervalsConfig({})).toBeNull();
    expect(readIntervalsConfig({ INTERVALS_TOKEN_KEY: Buffer.alloc(16).toString('base64') })).toBeNull();
  });
});

describe('connect', () => {
  let rows: Row[];
  beforeEach(() => { rows = []; intervalsLimiter.reset(); });
  const body = { ...window, athleteId: '0', key: SECRET };

  it('should refuse without settings, without a session and with bad input, and store nothing', async () => {
    expect((await connectKey(post(body), deps('u1', rows, undefined, { config: null }))).status).toBe(503);
    expect((await connectKey(post(body), deps(null, rows))).status).toBe(401);
    for (const bad of [{ ...body, key: 'short' }, { ...body, athleteId: '../x' }, { ...body, riderId: '../x' }, { ...body, oldest: 'soon' }, {}]) expect((await connectKey(post(bad), deps('u1', rows))).status).toBe(400);
    expect(rows).toHaveLength(0);
  });

  it('should try the key against Intervals.icu, store it encrypted and return the summaries of the bike rides only', async () => {
    const d = deps('u1', rows);
    const response = await connectKey(post(body), d);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.rides).toEqual([{ id: 'icu-i1', date: '2026-10-20', terrain: 'road', km: 42.3, elevationM: 512, gearId: 'b1', gearName: 'Road' }]);
    expect(JSON.stringify(json)).not.toContain(SECRET);
    expect(rows[0]).toMatchObject({ user_id: 'u1', rider_id: 'me', athlete_id: '0' });
    expect(rows[0].key_enc).not.toContain(SECRET);
    expect(decryptToken(rows[0].key_enc, KEY)).toBe(SECRET);
    expect(d.urls[0]).toContain('/athlete/0/activities');
  });

  it('should not store a key that Intervals.icu refuses, and say so with a fixed code', async () => {
    const response = await connectKey(post(body), deps('u1', rows, async () => new Response('', { status: 401 })));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ success: false, error: 'key_rejected' });
    expect(rows).toHaveLength(0);
  });

  it('should say when Intervals.icu is busy or down', async () => {
    expect((await connectKey(post(body), deps('u1', rows, async () => new Response('', { status: 429 })))).status).toBe(429);
    expect((await connectKey(post(body), deps('u1', rows, async () => new Response('', { status: 500 })))).status).toBe(502);
  });

  it('should keep one connection for each rider and replace the key of a rider', async () => {
    await connectKey(post(body), deps('u1', rows));
    await connectKey(post({ ...body, key: 'zyxwvuts98765' }), deps('u1', rows));
    await connectKey(post({ ...body, riderId: 'anna' }), deps('u1', rows));
    expect(rows.map((row) => row.rider_id).sort()).toEqual(['anna', 'me']);
    expect(decryptToken(rows.find((row) => row.rider_id === 'me')?.key_enc ?? '', KEY)).toBe('zyxwvuts98765');
  });
});

describe('sync and disconnect', () => {
  let rows: Row[];
  beforeEach(async () => { rows = []; intervalsLimiter.reset(); await connectKey(post({ ...window, athleteId: 'i123', key: SECRET }), deps('u1', rows)); });

  it('should read the rides with the stored key without ever sending the key back', async () => {
    const d = deps('u1', rows);
    const response = await syncKey(post(window), d);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.rides).toHaveLength(1);
    expect(JSON.stringify(json)).not.toContain(SECRET);
    expect(d.urls[0]).toContain('/athlete/i123/activities');
    expect(rows[0].last_sync_at).not.toBeNull();
  });

  it('should refuse a guest, a rider with no connection and a bad window', async () => {
    expect((await syncKey(post(window), deps(null, rows))).status).toBe(401);
    expect((await syncKey(post(window), deps('u2', rows))).status).toBe(409);
    expect((await syncKey(post({ ...window, riderId: 'anna' }), deps('u1', rows))).status).toBe(409);
    expect((await syncKey(post({ ...window, newest: 'x' }), deps('u1', rows))).status).toBe(400);
  });

  it('should treat a key that Intervals.icu no longer accepts as no connection, and a key this server cannot open as unavailable', async () => {
    expect((await syncKey(post(window), deps('u1', rows, async () => new Response('', { status: 401 })))).status).toBe(409);
    rows[0].key_enc = 'v1.broken.value.here';
    expect((await syncKey(post(window), deps('u1', rows))).status).toBe(502);
  });

  it('should never read the connection of another account', async () => {
    expect((await syncKey(post(window), deps('u2', rows))).status).toBe(409);
  });

  it('should limit how often one rider may ask', async () => {
    intervalsLimiter.reset();
    const d = deps('u1', rows);
    for (let i = 0; i < 30; i++) expect((await syncKey(post(window), d)).status).toBe(200);
    expect((await syncKey(post(window), d)).status).toBe(429);
  });

  it('should delete the stored key of the rider on disconnect and refuse a guest', async () => {
    expect((await disconnectKey(post({ riderId: 'me' }), deps(null, rows))).status).toBe(401);
    expect((await disconnectKey(post({ riderId: '../x' }), deps('u1', rows))).status).toBe(400);
    expect((await disconnectKey(post({ riderId: 'me' }), deps('u1', rows))).status).toBe(200);
    expect(rows).toHaveLength(0);
  });
});

describe('the migration of the connections', () => {
  const sql = readFileSync(join(process.cwd(), 'supabase/migrations/20261111000000_intervals_connections.sql'), 'utf8');

  it('should limit every action to the own rows, store only ciphertext and never use the service role', () => {
    expect(sql).toContain('enable row level security');
    for (const action of ['select', 'insert', 'update', 'delete']) expect(sql).toMatch(new RegExp(`for ${action} to authenticated`));
    expect(sql).toContain('auth.uid() = user_id');
    expect(sql).not.toMatch(/to anon|to public|service_role/);
    expect(sql).toContain('key_enc');
    expect(sql).not.toMatch(/\bkey text\b|\bapi_key\b/);
    expect(sql).toContain('on delete cascade');
  });
});
