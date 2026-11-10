'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

/** `guest`: no account, the key can only live in the browser. `off`: the table cannot be read (not set up), the browser mode is used. */
export type LinkStatus = 'checking' | 'guest' | 'off' | 'disconnected' | 'connected';

interface LinkDatabase {
  from: (table: 'intervals_connections') => { select: (columns: string) => PromiseLike<{ data: unknown; error: unknown }> };
}

/** Whether the signed in rider has a connection of Intervals.icu kept in the account (the row of the table, which row level security shows only to its owner). */
export function useIntervalsLink(riderId: string): { status: LinkStatus; setConnected: (connected: boolean) => void; usable: boolean } {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const [riders, setRiders] = useState<string[] | null | 'error'>(null);
  useEffect(() => {
    const db = auth.getDatabase() as unknown as LinkDatabase | null;
    if (auth.status !== 'authenticated' || !db) return;
    let cancelled = false;
    void db.from('intervals_connections').select('rider_id').then(({ data, error }) => {
      if (!cancelled) setRiders(error || !Array.isArray(data) ? 'error' : data.map((row) => String((row as { rider_id?: unknown }).rider_id)));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, userId]);
  const setConnected = useCallback((connected: boolean) => setRiders((before) => {
    const list = Array.isArray(before) ? before.filter((id) => id !== riderId) : [];
    return connected ? [...list, riderId] : list;
  }), [riderId]);
  const status: LinkStatus = auth.status === 'loading' || (auth.status === 'authenticated' && riders === null && auth.configured) ? 'checking'
    : auth.status !== 'authenticated' || !auth.configured ? 'guest'
    : riders === 'error' || riders === null ? 'off' : riders.includes(riderId) ? 'connected' : 'disconnected';
  return { status, setConnected, usable: status === 'connected' || status === 'disconnected' };
}
