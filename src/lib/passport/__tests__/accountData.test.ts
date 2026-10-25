import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { fakeDatabase } from '@/test/fakeAuthClient';
import { profileToPassport, passportToRow } from '../mappers';
import { buildExport, downloadExport, exportFileName } from '../exportFile';
import { deleteMyAccount, deleteRemotePassport, fetchRemotePassport, fetchRemoteRecord, type PassportDatabase } from '../remoteStore';

const passport = profileToPassport(DEFAULT_PROFILE, deriveCoordinates(DEFAULT_PROFILE));
const row = (extra: Record<string, unknown> = {}) => ({ ...passportToRow('u1', passport), ...extra }) as unknown as Record<string, unknown>;
const dbOf = (fake: ReturnType<typeof fakeDatabase>) => ({ from: fake.from, rpc: fake.rpc }) as unknown as PassportDatabase;

describe('fetchRemoteRecord', () => {
  it('should return the passport with the timestamps the database keeps', async () => {
    const fake = fakeDatabase();
    fake.rows.set('u1', row({ created_at: '2026-10-01T08:00:00Z', updated_at: '2026-10-22T09:30:00Z' }));
    const result = await fetchRemoteRecord(dbOf(fake), 'u1');
    expect(result).toEqual({ status: 'ok', record: { passport, createdAt: '2026-10-01T08:00:00Z', updatedAt: '2026-10-22T09:30:00Z' } });
  });

  it('should report no record when nothing is stored and drop timestamps that are not dates', async () => {
    const fake = fakeDatabase();
    expect(await fetchRemoteRecord(dbOf(fake), 'u1')).toEqual({ status: 'ok', record: null });
    fake.rows.set('u1', row({ created_at: 'yesterday', updated_at: 42 }));
    expect(await fetchRemoteRecord(dbOf(fake), 'u1')).toMatchObject({ status: 'ok', record: { createdAt: null, updatedAt: null } });
  });

  it('should report an unusable row and a failed read, and the passport read still agrees', async () => {
    const fake = fakeDatabase();
    fake.rows.set('u1', row({ discipline: 'unicycle' }));
    expect(await fetchRemoteRecord(dbOf(fake), 'u1')).toEqual({ status: 'invalid' });
    expect(await fetchRemotePassport(dbOf(fake), 'u1')).toEqual({ status: 'invalid' });
    fake.maybeSingle.mockResolvedValueOnce({ data: null, error: { code: 'x' } });
    expect(await fetchRemoteRecord(dbOf(fake), 'u1')).toEqual({ status: 'error' });
    fake.from.mockImplementationOnce(() => { throw new Error('offline'); });
    expect(await fetchRemoteRecord(dbOf(fake), 'u1')).toEqual({ status: 'error' });
  });
});

describe('deleting the stored data and the account', () => {
  it('should delete only the row of the rider', async () => {
    const fake = fakeDatabase();
    fake.rows.set('u1', row());
    fake.rows.set('u2', row({ id: 'u2' }));
    expect(await deleteRemotePassport(dbOf(fake), 'u1')).toBe(true);
    expect([...fake.rows.keys()]).toEqual(['u2']);
  });

  it('should report a failed delete and keep the row, also when the request throws', async () => {
    const fake = fakeDatabase();
    fake.rows.set('u1', row());
    fake.removeError.current = { code: '42501' };
    expect(await deleteRemotePassport(dbOf(fake), 'u1')).toBe(false);
    expect(fake.rows.has('u1')).toBe(true);
    fake.from.mockImplementationOnce(() => { throw new Error('offline'); });
    expect(await deleteRemotePassport(dbOf(fake), 'u1')).toBe(false);
  });

  it('should call the account deletion function without an id (the database uses the caller)', async () => {
    const fake = fakeDatabase();
    expect(await deleteMyAccount(dbOf(fake))).toBe(true);
    expect(fake.rpc).toHaveBeenCalledWith('delete_my_account');
    expect(fake.rpc.mock.calls[0]).toHaveLength(1);
  });

  it('should report a failed account deletion, also when the request throws', async () => {
    const fake = fakeDatabase();
    fake.rpc.mockResolvedValueOnce({ error: { code: '28000' } });
    expect(await deleteMyAccount(dbOf(fake))).toBe(false);
    fake.rpc.mockRejectedValueOnce(new Error('offline'));
    expect(await deleteMyAccount(dbOf(fake))).toBe(false);
  });
});

describe('export of my data', () => {
  const record = { passport, createdAt: '2026-10-01T08:00:00Z', updatedAt: '2026-10-22T09:30:00Z' };
  const now = new Date('2026-10-24T10:00:00Z');

  afterEach(() => vi.restoreAllMocks());

  it('should hold the export time, the account facts, the last save and the whole passport', () => {
    expect(buildExport(record, { email: 'rider@example.com', createdAt: '2026-09-30T00:00:00Z' }, now)).toEqual({
      exportedAt: '2026-10-24T10:00:00.000Z',
      account: { email: 'rider@example.com', createdAt: '2026-09-30T00:00:00Z' },
      passportSavedAt: '2026-10-22T09:30:00Z',
      passport,
      sharedBikes: [],
    });
  });

  it('should add the bikes that the rider shared: numbers and status only, no account id', () => {
    const shared = [{ id: 's1', userId: 'u1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'cube|attain|2024|54', spec: passport.bikes[0].components as never, status: 'pending' as const, catalogId: null, reviewNote: 'secret note', createdAt: '2026-10-23T10:00:00Z' }];
    const exported = buildExport(record, { email: null, createdAt: null }, now, shared);
    expect(exported.sharedBikes).toEqual([{ brand: 'Cube', model: 'Attain', year: 2024, size: '54', status: 'pending', sharedAt: '2026-10-23T10:00:00Z', spec: shared[0].spec }]);
    expect(JSON.stringify(exported)).not.toContain('u1');
    expect(JSON.stringify(exported)).not.toContain('secret note');
  });

  it('should name the file after the day of the export', () => {
    expect(exportFileName(now)).toBe('baik-my-data-2026-10-24.json');
  });

  it('should hand a JSON file to the browser and release it afterwards', async () => {
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadExport(buildExport(record, { email: null, createdAt: null }, now), now);
    const blob = (create.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe('application/json');
    expect(JSON.parse(await blob.text()).passport.discipline).toBe('road');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith('blob:x');
    expect(document.querySelector('a[download]')).toBeNull();
  });
});

describe('delete_my_account migration (guard)', () => {
  const sql = readFileSync('supabase/migrations/20261024000000_delete_my_account.sql', 'utf8');

  it('should run with the rights of its owner but a fixed search path', () => {
    expect(sql).toMatch(/security definer/);
    expect(sql).toContain("set search_path = ''");
  });

  it('should delete only the user of the caller and refuse an unauthenticated call', () => {
    expect(sql).toContain('auth.uid()');
    expect(sql).toMatch(/delete from auth\.users where id = caller;/);
    expect(sql.match(/^\s*delete from/gm)).toHaveLength(1);
    expect(sql).toMatch(/if caller is null then\s+raise exception/);
  });

  it('should be callable by signed in riders only', () => {
    expect(sql).toMatch(/revoke all on function public\.delete_my_account\(\) from public, anon;/);
    expect(sql).toMatch(/grant execute on function public\.delete_my_account\(\) to authenticated;/);
    expect(sql).not.toMatch(/grant [^;]* to [^;]*\b(anon|public)\b/);
  });
});
