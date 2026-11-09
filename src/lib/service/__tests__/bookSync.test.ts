import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_BOOK, type BikeBook, type LoggedRide, type ServiceEntry } from '@/types/service';
import { forAccount, fromAccount, planMerge, unionBooks } from '../bookSync';
import type { StoredBook } from '../bookStore';
import { deleteRemoteBooks, fetchRemoteBooks, saveRemoteBook, type BookDatabase } from '../bookRemote';

const entry = (id: string, at: string): ServiceEntry => ({ id, kind: 'chain', variant: null, at, value: null, price: null, currency: null, warrantyUntil: null, note: '' });
const ride = (id: string, date: string): LoggedRide => ({ id, date, terrain: 'road', km: 50, elevationM: 0, rain: false });
const book = (over: Partial<BikeBook> = {}): BikeBook => ({ ...DEFAULT_BOOK, ...over });
const local = (bikeId: string, b: BikeBook, updatedAt: string | null): StoredBook => ({ bikeId, book: b, updatedAt });
const remote = (bikeId: string, b: BikeBook, updatedAt: string) => ({ bikeId, book: b, updatedAt });
const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-02T10:00:00.000Z';

describe('what of a book goes to the account', () => {
  it('should leave the frame number, the insurance number and the photo in the browser', () => {
    const mine = book({ identity: { make: 'Cube', model: 'Attain', year: 2024, serial: 'WK123', insurance: 'POJ-9', photo: 'data:image/png;base64,AAAA' } });
    const sent = forAccount(mine);
    expect(sent.identity).toEqual({ make: 'Cube', model: 'Attain', year: 2024, serial: '', insurance: '', photo: null });
    expect(JSON.stringify(sent)).not.toMatch(/WK123|POJ-9|base64/);
  });

  it('should put the browser-only fields back when a book of the account is taken in', () => {
    const mine = book({ identity: { make: 'Cube', model: 'Attain', year: 2024, serial: 'WK123', insurance: '', photo: null } });
    const theirs = book({ identity: { make: 'Cube', model: 'Attain GTC', year: 2024, serial: '', insurance: '', photo: null }, log: [entry('e1', '2026-10-01')] });
    const taken = fromAccount(theirs, mine);
    expect(taken.identity).toMatchObject({ model: 'Attain GTC', serial: 'WK123' });
    expect(taken.log).toHaveLength(1);
  });
});

describe('the merge of the books of this browser with the account', () => {
  it('should take a book that only the account has, and send a book that only this browser has', () => {
    const plan = planMerge([local('a', book({ log: [entry('e1', '2026-10-01')] }), T1)], [remote('b', book({ log: [entry('e2', '2026-10-02')] }), T1)]);
    expect(plan).toEqual([{ bikeId: 'a', action: 'push' }, { bikeId: 'b', action: 'pull' }]);
  });

  it('should let the later change of a bike win, either side, and leave equal books alone', () => {
    const older = book({ log: [entry('e1', '2026-10-01')] });
    const newer = book({ log: [entry('e1', '2026-10-01'), entry('e2', '2026-10-05')] });
    expect(planMerge([local('a', older, T1)], [remote('a', newer, T2)])[0].action).toBe('pull');
    expect(planMerge([local('a', newer, T2)], [remote('a', older, T1)])[0].action).toBe('push');
    expect(planMerge([local('a', newer, T2)], [remote('a', newer, T2)])[0].action).toBe('same');
    expect(planMerge([local('a', newer, T1)], [remote('a', forAccount(newer), T2)])[0].action).toBe('same');
  });

  it('should put both books together when this browser has a book of unknown time, so that nothing is lost', () => {
    const mine = book({ log: [entry('e1', '2026-10-01')], rides: [ride('r1', '2026-10-10')] });
    const theirs = book({ log: [entry('e2', '2026-10-05')], rides: [ride('r2', '2026-10-11')] });
    expect(planMerge([local('a', mine, null)], [remote('a', theirs, T2)])[0].action).toBe('merge');
    const both = unionBooks(mine, theirs);
    expect(both.log.map((one) => one.id)).toEqual(['e2', 'e1']);
    expect(both.rides.map((one) => one.id)).toEqual(['r2', 'r1']);
  });

  it('should keep the newer day of a part marked as done and the pairing of either book', () => {
    const mine = book({ wearDone: { chainLube: '2026-10-01' }, strava: { gearId: 'b1', gearName: 'Road', since: '2026-08-01', syncedAt: null } });
    const theirs = book({ wearDone: { chainLube: '2026-10-20', brakeCheck: '2026-09-01' } });
    const both = unionBooks(mine, theirs);
    expect(both.wearDone).toEqual({ chainLube: '2026-10-20', brakeCheck: '2026-09-01' });
    expect(both.strava?.gearId).toBe('b1');
  });
});

describe('the books in the account table', () => {
  const fakeDb = (rows: unknown, error: { code?: string } | null = null) => {
    const upserts: unknown[] = [];
    const deletes: string[] = [];
    const db = {
      from: () => ({
        select: () => ({ eq: async () => ({ data: rows, error }) }),
        upsert: async (row: unknown) => (upserts.push(row), { error }),
        delete: () => ({ eq: async (_column: string, value: string) => (deletes.push(value), { error }) }),
      }),
    } as unknown as BookDatabase;
    return { db, upserts, deletes };
  };

  it('should read the rows as books, skip a row that is not usable, and report an unreadable answer', async () => {
    const good = { bike_id: 'a', updated_at: T1, data: { ...DEFAULT_BOOK, log: [entry('e1', '2026-10-01')] } };
    const result = await fetchRemoteBooks(fakeDb([good, { bike_id: '', updated_at: T1, data: {} }, { bike_id: 'b', updated_at: 'never', data: {} }, null]).db, 'u1');
    expect(result.status === 'ok' && result.books.map((one) => one.bikeId)).toEqual(['a']);
    expect((await fetchRemoteBooks(fakeDb(null, { code: '500' }).db, 'u1')).status).toBe('error');
  });

  it('should send one row per bike with the id of the rider and without the browser-only fields', async () => {
    const { db, upserts } = fakeDb([]);
    const mine = book({ identity: { make: 'Cube', model: '', year: null, serial: 'WK123', insurance: '', photo: null } });
    expect(await saveRemoteBook(db, 'u1', 'a', mine, T1)).toBe(true);
    expect(upserts[0]).toMatchObject({ user_id: 'u1', bike_id: 'a', updated_at: T1 });
    expect(JSON.stringify(upserts[0])).not.toContain('WK123');
  });

  it('should delete every row of the rider, and call a missing table nothing to delete', async () => {
    const ok = fakeDb([]);
    expect(await deleteRemoteBooks(ok.db, 'u1')).toBe(true);
    expect(ok.deletes).toEqual(['u1']);
    expect(await deleteRemoteBooks(fakeDb([], { code: '42P01' }).db, 'u1')).toBe(true);
    expect(await deleteRemoteBooks(fakeDb([], { code: '500' }).db, 'u1')).toBe(false);
  });
});

describe('the migrations of the books and of the purchases limit', () => {
  const sql = (name: string) => readFileSync(join(process.cwd(), 'supabase/migrations', name), 'utf8');

  it('should limit every action of the books to the own rows and never use the service role', () => {
    const books = sql('20261110000000_bike_books.sql');
    expect(books).toContain('enable row level security');
    for (const action of ['select', 'insert', 'update', 'delete']) expect(books).toMatch(new RegExp(`for ${action} to authenticated`));
    expect(books).toContain('auth.uid() = user_id');
    expect(books).not.toMatch(/to anon|to public|service_role/);
    expect(books).toContain('on delete cascade');
  });

  it('should refuse a new book over the limit of 20 but never refuse the update of a book that exists', () => {
    const books = sql('20261110000000_bike_books.sql');
    expect(books).toMatch(/>= 20/);
    expect(books.indexOf('if exists')).toBeLessThan(books.indexOf('>= 20'));
    const gear = sql('20261110000100_gear_purchases_limit_fix.sql');
    expect(gear.indexOf('if exists')).toBeLessThan(gear.indexOf('>= 10'));
  });
});
