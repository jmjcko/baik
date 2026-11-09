'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { readPurchases, subscribePurchases, writePurchases } from '@/lib/gear/purchaseStore';
import { deleteRemotePurchase, fetchRemotePurchases, saveRemotePurchase, type PurchaseDatabase } from '@/lib/gear/purchaseRemote';
import { canSave, mergePurchases, withPurchase, withoutPurchase, type SavedPurchase } from '@/lib/gear/savedPurchases';

const NONE: SavedPurchase[] = [];

/** Sign in: the purchases of this browser and of the account are merged (the later update of a purchase wins), and what the account lacks is written to it. */
function useAccountMerge(userId: string | null, getDatabase: () => unknown): void {
  useEffect(() => {
    const db = getDatabase() as PurchaseDatabase | null;
    if (!userId || !db) return;
    let live = true;
    void (async () => {
      const remote = await fetchRemotePurchases(db, userId);
      if (!live || remote.status !== 'ok') return;
      const merged = mergePurchases(readPurchases(), remote.purchases);
      writePurchases(merged);
      for (const purchase of merged) {
        const known = remote.purchases.find((one) => one.id === purchase.id);
        if (!known || Date.parse(purchase.updatedAt) > Date.parse(known.updatedAt)) await saveRemotePurchase(db, userId, purchase);
      }
    })();
    return () => { live = false; };
  }, [userId, getDatabase]);
}

/** Mounted once for the whole app: the purchases of this browser and of the account are merged at sign in, whichever module is open. */
export function useGearPurchaseSync(): void {
  const auth = useAuth();
  useAccountMerge(auth.status === 'authenticated' ? auth.user?.id ?? null : null, auth.getDatabase);
}

/** The purchases of the rider: kept in this browser at once and, for a signed in rider, in the account too (a failed write to the account leaves the browser copy, which is merged at the next sign in). */
export function useGearPurchases() {
  const auth = useAuth();
  const userId = auth.status === 'authenticated' ? auth.user?.id ?? null : null;
  const purchases = useSyncExternalStore(subscribePurchases, readPurchases, () => NONE);
  useAccountMerge(userId, auth.getDatabase);
  const remote = useCallback((run: (db: PurchaseDatabase, id: string) => Promise<boolean>) => {
    const db = auth.getDatabase() as PurchaseDatabase | null;
    if (userId && db) void run(db, userId);
  }, [auth, userId]);
  /** Saves (or replaces) a purchase; false when the list is full and the purchase is a new one. */
  const save = useCallback((purchase: SavedPurchase): boolean => {
    const list = readPurchases();
    if (!canSave(list, purchase.id)) return false;
    writePurchases(withPurchase(list, purchase));
    remote((db, id) => saveRemotePurchase(db, id, purchase));
    return true;
  }, [remote]);
  const remove = useCallback((purchaseId: string) => {
    writePurchases(withoutPurchase(readPurchases(), purchaseId));
    remote((db, id) => deleteRemotePurchase(db, id, purchaseId));
  }, [remote]);
  return { purchases, save, remove };
}
