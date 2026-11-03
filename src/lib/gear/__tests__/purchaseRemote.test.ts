import { describe, it, expect, vi } from 'vitest';
import { deleteRemotePurchase, fetchRemotePurchases, purchaseToRow, saveRemotePurchase, type PurchaseDatabase } from '../purchaseRemote';
import { initialState } from '../gearState';
import { purchaseFromState } from '../savedPurchases';

const one = purchaseFromState('p1', { ...initialState('en'), step: 1, title: 'Radar', status: 'ready' }, '2026-11-03T10:00:00.000Z');

function fakeDb(over: { rows?: unknown; error?: boolean; throws?: boolean } = {}) {
  const upsert = vi.fn(async () => ({ error: over.error ? { code: '42501' } : null }));
  const secondEq = vi.fn(async () => ({ error: over.error ? { code: '42501' } : null }));
  const firstEq = vi.fn(() => ({ eq: secondEq }));
  const selectEq = vi.fn(async () => { if (over.throws) throw new Error('offline'); return { data: over.rows ?? [], error: over.error ? { code: 'x' } : null }; });
  const db = { from: () => ({ select: () => ({ eq: selectEq }), upsert, delete: () => ({ eq: firstEq }) }) } as unknown as PurchaseDatabase;
  return { db, upsert, firstEq, secondEq, selectEq };
}

describe('the purchases in the account', () => {
  it('should write a purchase as one row of the rider with its status and time, and the whole purchase in the data', () => {
    expect(purchaseToRow('u1', one)).toEqual({ user_id: 'u1', id: 'p1', status: 'open', updated_at: one.updatedAt, data: one });
  });

  it('should read the rows of the rider, leaving out a row that cannot be used', async () => {
    const { db, selectEq } = fakeDb({ rows: [{ data: one }, { data: { broken: 1 } }, null] });
    expect(await fetchRemotePurchases(db, 'u1')).toEqual({ status: 'ok', purchases: [one] });
    expect(selectEq).toHaveBeenCalledWith('user_id', 'u1');
  });

  it('should report an error, never an empty list, when the database fails or is not reachable', async () => {
    expect(await fetchRemotePurchases(fakeDb({ error: true }).db, 'u1')).toEqual({ status: 'error' });
    expect(await fetchRemotePurchases(fakeDb({ throws: true }).db, 'u1')).toEqual({ status: 'error' });
  });

  it('should upsert by the rider and the id, and delete one purchase of the rider only', async () => {
    const { db, upsert, firstEq, secondEq } = fakeDb();
    expect(await saveRemotePurchase(db, 'u1', one)).toBe(true);
    expect(upsert).toHaveBeenCalledWith(purchaseToRow('u1', one), { onConflict: 'user_id,id' });
    expect(await deleteRemotePurchase(db, 'u1', 'p1')).toBe(true);
    expect(firstEq).toHaveBeenCalledWith('user_id', 'u1');
    expect(secondEq).toHaveBeenCalledWith('id', 'p1');
    const failing = fakeDb({ error: true }).db;
    expect(await saveRemotePurchase(failing, 'u1', one)).toBe(false);
    expect(await deleteRemotePurchase(failing, 'u1', 'p1')).toBe(false);
  });
});
