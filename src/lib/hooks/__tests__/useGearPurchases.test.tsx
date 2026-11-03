import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { UserSession } from '@/lib/auth/AuthContext';
import { initialState } from '@/lib/gear/gearState';
import { purchaseFromState, type SavedPurchase } from '@/lib/gear/savedPurchases';
import { readPurchases, writePurchases } from '@/lib/gear/purchaseStore';
import { useGearPurchases } from '../useGearPurchases';

const session = vi.hoisted(() => ({ current: null as unknown }));
vi.mock('@/lib/auth/AuthContext', () => ({ useAuth: () => session.current }));

const make = (id: string, day: number, notes = ''): SavedPurchase => purchaseFromState(id, { ...initialState('en'), step: 1, title: id, notes, status: 'ready' }, `2026-11-${String(day).padStart(2, '0')}T10:00:00.000Z`);

function accountWith(rows: SavedPurchase[]) {
  const upserts: unknown[] = [];
  const deletes: string[] = [];
  const db = {
    from: () => ({
      select: () => ({ eq: async () => ({ data: rows.map((data) => ({ data })), error: null }) }),
      upsert: async (row: unknown) => { upserts.push(row); return { error: null }; },
      delete: () => ({ eq: () => ({ eq: async (_c: string, id: string) => { deletes.push(id); return { error: null }; } }) }),
    }),
  };
  const auth = { status: 'authenticated', user: { id: 'u1' }, getDatabase: () => db } as unknown as UserSession;
  return { auth, upserts, deletes };
}

const guest = { status: 'anonymous', user: null, getDatabase: () => null } as unknown as UserSession;

describe('the purchases of the rider', () => {
  it('should keep a purchase in this browser for a guest, replace it by id, refuse an eleventh and delete one', () => {
    session.current = guest;
    const { result } = renderHook(() => useGearPurchases());
    expect(result.current.purchases).toEqual([]);
    act(() => { expect(result.current.save(make('a', 1))).toBe(true); });
    act(() => { result.current.save(make('a', 2, 'later')); });
    expect(result.current.purchases).toHaveLength(1);
    expect(result.current.purchases[0].notes).toBe('later');
    expect(readPurchases()).toHaveLength(1);
    for (let i = 0; i < 9; i++) act(() => { result.current.save(make(`x${i}`, i + 3)); });
    expect(result.current.purchases).toHaveLength(10);
    let accepted = true;
    act(() => { accepted = result.current.save(make('eleven', 20)); });
    expect(accepted).toBe(false);
    expect(result.current.purchases).toHaveLength(10);
    act(() => result.current.remove('a'));
    expect(result.current.purchases).toHaveLength(9);
  });

  it('should merge the browser and the account at sign in, keep the later update, and write to the account what it lacks', async () => {
    const account = accountWith([make('a', 4, 'account'), make('c', 3)]);
    writePurchases([make('a', 5, 'device'), make('b', 2)]);
    session.current = account.auth;
    const { result } = renderHook(() => useGearPurchases());
    await waitFor(() => expect(result.current.purchases.map((one) => one.id)).toEqual(['a', 'c', 'b']));
    expect(result.current.purchases[0].notes).toBe('device');
    await waitFor(() => expect(account.upserts.map((row) => (row as { id: string }).id).sort()).toEqual(['a', 'b']));
  });

  it('should write a save and a delete to the account for a signed in rider', async () => {
    const account = accountWith([]);
    session.current = account.auth;
    const { result } = renderHook(() => useGearPurchases());
    act(() => { result.current.save(make('n', 9)); });
    await waitFor(() => expect(account.upserts).toHaveLength(1));
    expect(account.upserts[0]).toMatchObject({ user_id: 'u1', id: 'n', status: 'open' });
    act(() => result.current.remove('n'));
    await waitFor(() => expect(account.deletes).toEqual(['n']));
  });
});
