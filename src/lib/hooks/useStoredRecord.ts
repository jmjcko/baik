'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchRemoteRecord, type RemoteRecord } from '@/lib/passport/remoteStore';

export type StoredRecordState =
  | { status: 'loading' }
  | { status: 'ready'; record: RemoteRecord | null }
  | { status: 'error' };

/**
 * What the account stores about the signed in rider right now: read from the database when the page opens and again
 * after every save (`refreshKey`), so the page shows the stored data and not only what is in memory.
 */
export function useStoredRecord(refreshKey: number): StoredRecordState {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const [state, setState] = useState<StoredRecordState>({ status: 'loading' });

  useEffect(() => {
    const db = auth.getDatabase();
    if (!db || !userId) return;
    let cancelled = false;
    void fetchRemoteRecord(db, userId).then((result) => {
      if (cancelled) return;
      setState(result.status === 'ok' ? { status: 'ready', record: result.record } : { status: 'error' });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey]);

  return state;
}
