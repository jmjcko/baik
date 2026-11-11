// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CONSENT_TEXT_VERSION, type ConsentPurpose } from '@/lib/consent/purposes';
import { encryptToken } from '@/lib/strava/crypto';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { runRides, type RunDeps } from '../runRides';

const KEY = Buffer.alloc(32, 7);
const NOW = Date.parse('2026-11-10T05:00:00Z');
type Row = Record<string, unknown>;
type Tables = Record<'intervals_connections' | 'bike_books' | 'consents', Row[]>;

/** A fake Supabase client over lists of rows: it understands exactly the queries of the cron. */
function fakeDb(tables: Tables): SupabaseClient {
  const from = (name: keyof Tables) => {
    const query = (rows: Row[], patch: Row | null) => {
      const filters: Array<[string, unknown]> = [];
      let max = Infinity;
      let wantRows = patch === null;
      const matching = () => rows.filter((row) => filters.every(([column, value]) => row[column] === value));
      const link: Record<string, unknown> = {};
      link.eq = (column: string, value: unknown) => (filters.push([column, value]), link);
      link.order = () => { rows.sort((a, b) => String(a.last_sync_at ?? '').localeCompare(String(b.last_sync_at ?? ''))); return link; };
      link.limit = (n: number) => { max = n; return link; };
      link.maybeSingle = async () => ({ data: matching()[0] ?? null, error: null });
      link.select = () => { wantRows = true; return link; };
      link.then = (resolve: (value: unknown) => void) => {
        const hit = matching().slice(0, max);
        if (patch) hit.forEach((row) => Object.assign(row, patch));
        resolve({ data: wantRows ? hit : null, error: null });
      };
      return link;
    };
    return { select: () => query(tables[name], null), update: (patch: Row) => query(tables[name], patch) };
  };
  return { from } as unknown as SupabaseClient;
}

const activity = (id: string, over: Record<string, unknown> = {}) => ({ id, type: 'Ride', distance: 40_000, total_elevation_gain: 300, start_date_local: '2026-10-20T07:00:00', gear: { id: 'b1', name: 'Road' }, ...over });
const paired = (): BikeBook => ({ ...DEFAULT_BOOK, intervals: { gearId: 'b1', gearName: 'Road', types: [], since: '2026-10-01', syncedAt: null } });
const consent = (userId: string, purpose: ConsentPurpose, granted = true): Row => ({ user_id: userId, purpose, text_version: CONSENT_TEXT_VERSION[purpose], granted, decided_at: '2026-11-01T10:00:00.000Z' });
const connection = (userId: string, riderId = 'me'): Row => ({ user_id: userId, rider_id: riderId, athlete_id: '0', key_enc: encryptToken('abcdefgh12345', KEY), last_sync_at: null });
const book = (userId: string, bikeId: string, data: BikeBook = paired()): Row => ({ user_id: userId, bike_id: bikeId, updated_at: '2026-11-09T10:00:00.000Z', data });
const agreed = (userId: string): Row[] => [consent(userId, 'health_storage'), consent(userId, 'intervals')];

function setup(tables: Partial<Tables>, answer: () => Response = () => Response.json([activity('a1'), activity('a2', { type: 'Run' })])) {
  const all: Tables = { intervals_connections: [], bike_books: [], consents: [], ...tables };
  const urls: string[] = [];
  const deps: RunDeps = { db: fakeDb(all), config: { tokenKey: KEY }, fetcher: async (url) => (urls.push(url), answer()), now: () => NOW, budgetMs: 8000 };
  return { all, deps, urls };
}

describe('the daily load of rides', () => {
  it('should merge the rides into the paired book of a rider who agreed, and write only that book', async () => {
    const { all, deps, urls } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1'), book('u1', 'bike2', DEFAULT_BOOK)], consents: agreed('u1') });
    const report = await runRides(deps);
    expect(report).toEqual({ riders: 1, booksUpdated: 1, skipped: 0, failed: 0, stoppedEarly: false, noConsent: { health_storage: 0, intervals: 0 } });
    expect(urls).toHaveLength(1);
    const rides = (all.bike_books[0].data as BikeBook).rides;
    expect(rides.map((ride) => ride.id)).toEqual(['icu-a1']);
    expect(all.bike_books[0].updated_at).toBe('2026-11-10T05:00:00.000Z');
    expect(all.bike_books[1].data).toEqual(DEFAULT_BOOK);
    expect(all.intervals_connections[0].last_sync_at).not.toBeNull();
  });

  it('should leave the book alone when no ride is new', async () => {
    const { all, deps } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    await runRides(deps);
    const afterFirst = all.bike_books[0].updated_at;
    all.bike_books[0].updated_at = '2026-11-09T11:00:00.000Z';
    expect((await runRides(deps)).booksUpdated).toBe(0);
    expect(afterFirst).toBe('2026-11-10T05:00:00.000Z');
    expect(all.bike_books[0].updated_at).toBe('2026-11-09T11:00:00.000Z');
  });

  it('should skip a rider without the consent to store health data or to use Intervals.icu, say which one is missing, and never call the service for them', async () => {
    const cases: Array<[Row[], { health_storage: number; intervals: number }]> = [
      [[], { health_storage: 1, intervals: 1 }],
      [[consent('u1', 'health_storage'), consent('u1', 'intervals', false)], { health_storage: 0, intervals: 1 }],
      [[consent('u1', 'intervals')], { health_storage: 1, intervals: 0 }],
    ];
    for (const [consents, missing] of cases) {
      const { deps, urls } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1')], consents });
      expect(await runRides(deps)).toMatchObject({ skipped: 1, noConsent: missing });
      expect(urls).toHaveLength(0);
    }
  });

  it('should leave a rider with several connections to the app, because a book does not say which rider it belongs to', async () => {
    const { deps, urls } = setup({ intervals_connections: [connection('u1', 'me'), connection('u1', 'anna')], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    expect(await runRides(deps)).toMatchObject({ riders: 0, skipped: 2 });
    expect(urls).toHaveLength(0);
  });

  it('should not overwrite a book that changed after it was read', async () => {
    const { all, deps } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    const racing: RunDeps = { ...deps, fetcher: async () => { all.bike_books[0].updated_at = '2026-11-10T04:59:00.000Z'; return Response.json([activity('a1')]); } };
    expect((await runRides(racing)).booksUpdated).toBe(0);
    expect((all.bike_books[0].data as BikeBook).rides).toEqual([]);
  });

  it('should count a refused key as a failure, keep the other riders going and rotate the failed one to the back', async () => {
    const { all, deps } = setup({ intervals_connections: [connection('u1'), connection('u2')], bike_books: [book('u1', 'b'), book('u2', 'b')], consents: [...agreed('u1'), ...agreed('u2')] });
    let calls = 0;
    const report = await runRides({ ...deps, fetcher: async () => (calls += 1) === 1 ? new Response('no', { status: 401 }) : Response.json([activity('a1')]) });
    expect(report).toMatchObject({ riders: 2, failed: 1, booksUpdated: 1 });
    expect(all.intervals_connections.every((row) => row.last_sync_at !== null)).toBe(true);
  });

  it('should count a key that this server cannot open as a failure and not touch the books', async () => {
    const wrong = { ...connection('u1'), key_enc: 'v1.x.y.z' };
    const { all, deps } = setup({ intervals_connections: [wrong], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    expect((await runRides(deps)).failed).toBe(1);
    expect((all.bike_books[0].data as BikeBook).rides).toEqual([]);
  });

  it('should count no update and not throw when the write of the book fails', async () => {
    const { deps } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    const real = deps.db.from.bind(deps.db);
    const failing = (): unknown => { const link: Record<string, unknown> = {}; link.eq = () => link; link.select = () => link; link.then = (resolve: (value: unknown) => void) => resolve({ data: null, error: { message: 'denied' } }); return link; };
    const db = { from: (table: string) => (table === 'bike_books' ? { ...real(table), update: failing } : real(table)) } as unknown as RunDeps['db'];
    expect(await runRides({ ...deps, db })).toMatchObject({ riders: 1, booksUpdated: 0, failed: 0 });
  });

  it('should report a failure, not an empty queue, when the connections cannot be read', async () => {
    const { deps } = setup({});
    const broken = { from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: 'denied' } }) }) }) }) } as unknown as RunDeps['db'];
    expect(await runRides({ ...deps, db: broken })).toMatchObject({ riders: 0, failed: 1 });
  });

  it('should count a rider whose consents cannot be read as a failure, not as a missing consent, and call nothing', async () => {
    const { deps, urls } = setup({ intervals_connections: [connection('u1')], bike_books: [book('u1', 'bike1')], consents: agreed('u1') });
    const real = deps.db.from.bind(deps.db);
    const denied = { select: () => ({ eq: async () => ({ data: null, error: { message: 'denied' } }) }) };
    const db = { from: (table: string) => (table === 'consents' ? denied : real(table)) } as unknown as RunDeps['db'];
    expect(await runRides({ ...deps, db })).toMatchObject({ riders: 1, failed: 1, skipped: 0, noConsent: { health_storage: 0, intervals: 0 } });
    expect(urls).toHaveLength(0);
  });

  it('should stop taking riders when the time budget is used up', async () => {
    let clock = NOW;
    const { deps } = setup({ intervals_connections: [connection('u1'), connection('u2')], bike_books: [book('u1', 'b'), book('u2', 'b')], consents: [...agreed('u1'), ...agreed('u2')] });
    const report = await runRides({ ...deps, now: () => (clock += 5000) });
    expect(report.stoppedEarly).toBe(true);
    expect(report.riders).toBeLessThan(2);
  });
});
