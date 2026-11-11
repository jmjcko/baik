'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mergeConsents, type ConsentMap } from './consentStore';
import { fetchRemoteConsents, saveRemoteConsents, type ConsentDatabase } from './consentRemote';
import { useConsents, writeConsents } from './useConsent';

const sameMap = (a: ConsentMap, b: ConsentMap) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Keeps the decisions of a signed in rider in the account: the newer decision of each purpose wins, in both directions. Mounted once in the app.
 * A failing request leaves everything as it was; the next change tries again.
 * Returns whether the decisions of the account were read for this rider (so that a question is never asked before the answer that is already in the account is known).
 */
export function useConsentSync(): boolean {
  const { status, user, getDatabase } = useAuth();
  const local = useConsents();
  const userId = status === 'authenticated' ? (user?.id ?? null) : null;
  const [readFor, setReadFor] = useState<string | null>(null);
  useEffect(() => {
    const db = userId ? (getDatabase() as unknown as ConsentDatabase | null) : null;
    if (!userId || !db) return;
    let cancelled = false;
    void (async () => {
      const remote = await fetchRemoteConsents(db, userId);
      if (cancelled || remote === null) return;
      const merged = mergeConsents(local, remote);
      if (!sameMap(merged, local)) writeConsents(merged);
      if (!cancelled) setReadFor(userId);
      if (!sameMap(merged, remote)) await saveRemoteConsents(db, userId, merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, local, getDatabase]);
  return userId !== null && readFor === userId;
}
