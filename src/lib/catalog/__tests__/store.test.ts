import { describe, it, expect, vi } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { fakeDatabase } from '@/test/fakeAuthClient';
import {
  approveSubmission, deleteCatalogBike, deleteMySubmissions, fetchCatalog, fetchIsAdmin, fetchMySubmissions, fetchPending, mergeSubmission,
  parseCatalogRow, parseSubmissionRow, readCatalog, rejectSubmission, saveOwnerBike, submitBike, type CatalogDatabase,
} from '../store';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const catalogRow = { id: 'c1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'cube|attain|2024|54', spec, origin: 'community', confirmations: 2, note: null };
const submissionRow = { id: 's1', user_id: 'u1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'cube|attain|2024|54', spec, status: 'pending', catalog_id: null, review_note: null, created_at: '2026-10-23T10:00:00Z' };
const share = { brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec };
const dbOf = (fake: ReturnType<typeof fakeDatabase>) => ({ from: fake.from, rpc: fake.rpc }) as unknown as CatalogDatabase;

describe('parsing rows of the database', () => {
  it('should read a catalog row and a submission row', () => {
    expect(parseCatalogRow(catalogRow)).toEqual({ ...catalogRow, spec });
    expect(parseSubmissionRow(submissionRow)).toMatchObject({ id: 's1', userId: 'u1', status: 'pending', catalogId: null, reviewNote: null, createdAt: '2026-10-23T10:00:00Z' });
  });

  it('should drop a row that is not well formed or has an implausible spec', () => {
    for (const bad of [null, 'x', [], { ...catalogRow, spec: { ...spec, frameStackMm: 5 } }, { ...catalogRow, origin: 'admin' }, { ...catalogRow, confirmations: -1 }, { ...catalogRow, brand: '' }, { ...catalogRow, year: 2024.5 }, { ...catalogRow, id: undefined }]) {
      expect(parseCatalogRow(bad)).toBeNull();
    }
    for (const bad of [null, { ...submissionRow, status: 'done' }, { ...submissionRow, key: undefined }, { ...submissionRow, size: 'x'.repeat(13) }]) expect(parseSubmissionRow(bad)).toBeNull();
  });

  it('should keep an anonymous submission (the account was deleted) and trim a long note', () => {
    expect(parseSubmissionRow({ ...submissionRow, user_id: null })?.userId).toBeNull();
    expect(parseCatalogRow({ ...catalogRow, note: 'n'.repeat(500) })?.note).toHaveLength(300);
  });
});

describe('reading', () => {
  it('should read the approved bikes and skip the rows that cannot be used', async () => {
    const fake = fakeDatabase();
    fake.tables.bike_catalog = [catalogRow, { ...catalogRow, id: 'bad', spec: {} }];
    expect(await fetchCatalog(dbOf(fake))).toHaveLength(1);
    expect(await readCatalog(dbOf(fake))).toHaveLength(1);
  });

  it('should treat an unreadable or missing catalog as empty for the lists and as unknown for the admin', async () => {
    const fake = fakeDatabase();
    fake.tableError.current = { code: '42P01' };
    expect(await fetchCatalog(dbOf(fake))).toEqual([]);
    expect(await readCatalog(dbOf(fake))).toBeNull();
    expect(await fetchPending(dbOf(fake))).toBeNull();
    expect(await fetchMySubmissions(dbOf(fake))).toEqual([]);
    const throwing = { from: () => { throw new Error('offline'); }, rpc: () => { throw new Error('offline'); } } as unknown as CatalogDatabase;
    expect(await fetchCatalog(throwing)).toEqual([]);
    expect(await fetchPending(throwing)).toBeNull();
    expect(await fetchMySubmissions(throwing)).toEqual([]);
    expect(await fetchIsAdmin(throwing)).toBe(false);
  });

  it('should read the pending submissions only', async () => {
    const fake = fakeDatabase();
    fake.tables.bike_submissions = [submissionRow, { ...submissionRow, id: 's2', status: 'approved' }];
    expect((await fetchPending(dbOf(fake)))?.map((s) => s.id)).toEqual(['s1']);
  });

  it('should ask the database whether the user is an admin, and say no for anything but true', async () => {
    const fake = fakeDatabase();
    expect(await fetchIsAdmin(dbOf(fake))).toBe(false);
    fake.rpcResults.is_admin = { data: true };
    expect(await fetchIsAdmin(dbOf(fake))).toBe(true);
    fake.rpcResults.is_admin = { data: 'yes' };
    expect(await fetchIsAdmin(dbOf(fake))).toBe(false);
    fake.rpcResults.is_admin = { data: true, error: { code: '500' } };
    expect(await fetchIsAdmin(dbOf(fake))).toBe(false);
  });
});

describe('sharing and deleting', () => {
  it('should share the numbers only: no picture, no link, no personal data', async () => {
    const fake = fakeDatabase();
    expect(await submitBike(dbOf(fake), 'u1', { ...share, extra: 'x' } as typeof share)).toBe(true);
    expect(fake.submissionsUpsert).toHaveBeenCalledWith({ user_id: 'u1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec }, { onConflict: 'user_id,key' });
    expect(Object.keys(fake.submissionsUpsert.mock.calls[0][0]).sort()).toEqual(['brand', 'model', 'size', 'spec', 'user_id', 'year']);
  });

  it('should replace the earlier submission of the same rider for the same bike size', async () => {
    const fake = fakeDatabase();
    await submitBike(dbOf(fake), 'u1', share);
    await submitBike(dbOf(fake), 'u1', { ...share, spec: { ...spec, frameStackMm: 600 } });
    await submitBike(dbOf(fake), 'u2', share);
    expect(fake.tables.bike_submissions).toHaveLength(2);
  });

  it('should report a failed share, also when the request throws', async () => {
    const fake = fakeDatabase();
    fake.tableError.current = { code: '42501' };
    expect(await submitBike(dbOf(fake), 'u1', share)).toBe(false);
    expect(await submitBike({ from: () => { throw new Error('x'); }, rpc: vi.fn() } as unknown as CatalogDatabase, 'u1', share)).toBe(false);
  });

  it('should delete the own submissions, and count a missing table as nothing to delete', async () => {
    const fake = fakeDatabase();
    fake.tables.bike_submissions = [submissionRow, { ...submissionRow, id: 's2', user_id: 'u2' }];
    expect(await deleteMySubmissions(dbOf(fake), 'u1')).toBe(true);
    expect(fake.tables.bike_submissions.map((s) => s.id)).toEqual(['s2']);
    for (const code of ['42P01', 'PGRST205']) {
      fake.tableError.current = { code };
      expect(await deleteMySubmissions(dbOf(fake), 'u1')).toBe(true);
    }
    fake.tableError.current = { code: '42501' };
    expect(await deleteMySubmissions(dbOf(fake), 'u1')).toBe(false);
    expect(await deleteMySubmissions({ from: () => { throw new Error('x'); }, rpc: vi.fn() } as unknown as CatalogDatabase, 'u1')).toBe(false);
  });
});

describe('the admin functions', () => {
  it('should call the functions with their arguments', async () => {
    const fake = fakeDatabase();
    const db = dbOf(fake);
    expect(await approveSubmission(db, { submissionId: 's1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec, note: 'maker page' })).toBe(true);
    expect(fake.rpc).toHaveBeenLastCalledWith('approve_submission', { p_submission: 's1', p_brand: 'Cube', p_model: 'Attain', p_year: 2024, p_size: '54', p_spec: spec, p_note: 'maker page' });
    expect(await mergeSubmission(db, 's1', 'c1')).toBe(true);
    expect(fake.rpc).toHaveBeenLastCalledWith('merge_submission', { p_submission: 's1', p_catalog: 'c1' });
    expect(await rejectSubmission(db, 's1', 'not a bike')).toBe(true);
    expect(fake.rpc).toHaveBeenLastCalledWith('reject_submission', { p_submission: 's1', p_note: 'not a bike' });
    expect(await saveOwnerBike(db, share, null)).toBe(true);
    expect(fake.rpc).toHaveBeenLastCalledWith('admin_save_bike', { p_brand: 'Cube', p_model: 'Attain', p_year: 2024, p_size: '54', p_spec: spec, p_note: null });
    expect(await deleteCatalogBike(db, 'c1')).toBe(true);
    expect(fake.rpc).toHaveBeenLastCalledWith('admin_delete_catalog_bike', { p_catalog: 'c1' });
  });

  it('should report a refused or failed call as false', async () => {
    const fake = fakeDatabase();
    fake.rpcResults.reject_submission = { error: { code: '42501' } };
    expect(await rejectSubmission(dbOf(fake), 's1', null)).toBe(false);
    expect(await mergeSubmission({ from: vi.fn(), rpc: () => { throw new Error('offline'); } } as unknown as CatalogDatabase, 's1', 'c1')).toBe(false);
  });
});
