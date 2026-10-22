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
    client: { auth, from: database.from } as unknown as AuthClient,
    auth,
    database,
    unsubscribe,
    emit: (event: string, session: Session | null) => listener(event, session),
  };
}

/** An in-memory table `rider_profiles`; `rows` holds what a sign in would find, the spies show what the app wrote. */
export function fakeDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  const upsert = vi.fn(async (row: Record<string, unknown>) => {
    rows.set(row.id as string, row);
    return { error: null as { code?: string } | null };
  });
  const maybeSingle = vi.fn(async () => ({ data: null as unknown, error: null as { code?: string } | null }));
  const from = vi.fn(() => ({
    select: () => ({ eq: (_column: string, id: string) => ({ maybeSingle: async () => ({ ...(await maybeSingle()), data: rows.get(id) ?? null }) }) }),
    upsert,
  }));
  return { rows, upsert, maybeSingle, from };
}

export const riderSession = { user: { id: 'u1', email: 'rider@example.com' } } as unknown as Session;
