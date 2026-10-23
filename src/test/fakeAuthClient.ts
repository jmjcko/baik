import { vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import type { AuthClient } from '@/lib/auth/AuthContext';

type Listener = (event: string, session: Session | null) => void;

/** A fake Supabase client for tests: the auth calls are spies, `emit` plays an auth event, no call touches the network. */
export function fakeAuthClient() {
  let listener: Listener = () => undefined;
  const unsubscribe = vi.fn();
  const auth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn((callback: Listener) => {
      listener = callback;
      return { data: { subscription: { id: 'x', callback, unsubscribe } } };
    }),
    signInWithPassword: vi.fn(async () => ({ data: {}, error: null })),
    signUp: vi.fn(async () => ({ data: {}, error: null })),
    signInWithOtp: vi.fn(async () => ({ data: {}, error: null })),
    signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  };
  const database = fakeDatabase();
  return {
    client: { auth, from: database.from, rpc: database.rpc } as unknown as AuthClient,
    auth,
    database,
    unsubscribe,
    emit: (event: string, session: Session | null) => listener(event, session),
  };
}

/** An in-memory table `rider_profiles`; `rows` holds what a sign in would find, the spies show what the app wrote. The catalog tables (`bike_catalog`, `bike_submissions`) are plain arrays in `tables`. */
export function fakeDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  const tables: Record<string, Array<Record<string, unknown>>> = { bike_catalog: [], bike_submissions: [] };
  const tableError = { current: null as { code?: string } | null };
  const upsert = vi.fn(async (row: Record<string, unknown>) => {
    rows.set(row.id as string, row);
    return { error: null as { code?: string } | null };
  });
  const maybeSingle = vi.fn(async () => ({ data: null as unknown, error: null as { code?: string } | null }));
  const remove = vi.fn(async (id: string) => {
    if (removeError.current) return { error: removeError.current };
    rows.delete(id);
    return { error: null as { code?: string } | null };
  });
  const removeError = { current: null as { code?: string } | null };

  const submissionsUpsert = vi.fn(async (row: Record<string, unknown>) => {
    if (tableError.current) return { error: tableError.current };
    const same = (existing: Record<string, unknown>) => existing.user_id === row.user_id && JSON.stringify([existing.brand, existing.model, existing.year, existing.size]) === JSON.stringify([row.brand, row.model, row.year, row.size]);
    tables.bike_submissions = [...tables.bike_submissions.filter((existing) => !same(existing)), { id: `s${tables.bike_submissions.length + 1}`, status: 'pending', key: '', ...row }];
    return { error: null as { code?: string } | null };
  });
  const submissionsRemove = vi.fn(async (userId: string) => {
    if (tableError.current) return { error: tableError.current };
    tables.bike_submissions = tables.bike_submissions.filter((row) => row.user_id !== userId);
    return { error: null as { code?: string } | null };
  });
  const listOf = (table: string) => async () => (tableError.current ? { data: null, error: tableError.current } : { data: tables[table], error: null as { code?: string } | null });
  const tableApi = (table: string) => {
    const list = listOf(table);
    const select = () => Object.assign(list(), { eq: async (_column: string, value: string) => (tableError.current ? { data: null, error: tableError.current } : { data: tables[table].filter((row) => row.status === value), error: null }) });
    return { select, upsert: submissionsUpsert, delete: () => ({ eq: (_column: string, id: string) => submissionsRemove(id) }) };
  };

  const from = vi.fn((table: string) => {
    if (table !== 'rider_profiles') return tableApi(table);
    return {
      select: () => ({ eq: (_column: string, id: string) => ({ maybeSingle: async () => ({ ...(await maybeSingle()), data: rows.get(id) ?? null }) }) }),
      upsert,
      delete: () => ({ eq: (_column: string, id: string) => remove(id) }),
    };
  });
  const rpcResults: Record<string, { data?: unknown; error?: { code?: string } | null }> = {};
  const rpc = vi.fn<(fn: string, args?: Record<string, unknown>) => Promise<{ data?: unknown; error: { code?: string } | null }>>(async (fn) => ({ data: rpcResults[fn]?.data ?? null, error: rpcResults[fn]?.error ?? null }));
  return { rows, tables, tableError, upsert, maybeSingle, from, remove, removeError, rpc, rpcResults, submissionsUpsert, submissionsRemove };
}

export const riderSession = { user: { id: 'u1', email: 'rider@example.com' } } as unknown as Session;
