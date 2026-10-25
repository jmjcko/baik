'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCatalogDb } from '@/lib/catalog/hooks';
import {
  approveSubmission, clearBikeMiss, deleteCatalogBike, fetchBikeMisses, mergeSubmission, readCatalog, rejectSubmission, saveOwnerBike, fetchPending,
  type ApprovalInput, type CatalogDatabase,
} from '@/lib/catalog/store';
import type { BikeMiss, BikeShare, CatalogRow, SubmissionRow } from '@/lib/catalog/types';

export interface AdminData {
  status: 'loading' | 'ready' | 'error';
  pending: SubmissionRow[];
  catalog: CatalogRow[];
  /** The bikes that riders looked for and did not find, the most wanted first. */
  misses: BikeMiss[];
}

const LOADING: AdminData = { status: 'loading', pending: [], catalog: [], misses: [] };

/** Saves the owner's bikes one after the other; returns how many were saved. */
async function saveBikes(db: CatalogDatabase, bikes: BikeShare[], note: string | null): Promise<number> {
  let saved = 0;
  for (const bike of bikes) if (await saveOwnerBike(db, bike, note)) saved++;
  return saved;
}

/** The changes the owner can make; each one reloads the page data when it worked. */
function adminActions(getDb: () => CatalogDatabase | null, load: () => Promise<void>) {
  const change = async (act: (db: CatalogDatabase) => Promise<boolean>): Promise<boolean> => {
    const db = getDb();
    const ok = db ? await act(db) : false;
    if (ok) await load();
    return ok;
  };
  return {
    approve: (input: ApprovalInput) => change((db) => approveSubmission(db, input)),
    merge: (submissionId: string, catalogId: string) => change((db) => mergeSubmission(db, submissionId, catalogId)),
    reject: (submissionId: string, note: string | null) => change((db) => rejectSubmission(db, submissionId, note)),
    saveOwnerMany: async (bikes: BikeShare[], note: string | null): Promise<number> => {
      let saved = 0;
      await change(async (db) => {
        saved = await saveBikes(db, bikes, note);
        return saved > 0;
      });
      return saved;
    },
    remove: (catalogId: string) => change((db) => deleteCatalogBike(db, catalogId)),
    clearMiss: (key: string) => change((db) => clearBikeMiss(db, key)),
  };
}

/** The queue and the catalog of the admin page, and the changes the owner can make (each one reloads the page data when it worked). */
export function useAdminData() {
  const getDb = useCatalogDb();
  const [data, setData] = useState<AdminData>(LOADING);

  const load = useCallback(async () => {
    const db = getDb();
    const [pending, catalog, misses] = await (db ? Promise.all([fetchPending(db), readCatalog(db), fetchBikeMisses(db)]) : Promise.resolve([null, null, []] as const));
    setData(pending && catalog ? { status: 'ready', pending, catalog, misses } : { ...LOADING, status: 'error' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The page data comes from the network, so it is read from an effect on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return {
    data,
    reload: () => {
      setData(LOADING);
      return load();
    },
    ...adminActions(getDb, load),
  };
}

export type AdminActions = ReturnType<typeof useAdminData>;
