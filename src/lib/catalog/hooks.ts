'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { bikesFromCatalog, type CatalogBikes } from './catalogBikes';
import { fetchCatalog, fetchIsAdmin, type CatalogDatabase } from './store';
import type { CatalogRow } from './types';

/** The table access of the browser (the Supabase client), or null when Supabase is not set up; looked up when needed. */
export function useCatalogDb(): () => CatalogDatabase | null {
  const auth = useAuth();
  return () => auth.getDatabase() as unknown as CatalogDatabase | null;
}

const NONE: CatalogRow[] = [];

/** The approved bikes of the catalog, read once when the picker opens; without Supabase or without the table it is empty. */
export function useCatalogRows(): CatalogRow[] {
  const getDb = useCatalogDb();
  const [rows, setRows] = useState<CatalogRow[]>(NONE);
  useEffect(() => {
    const db = getDb();
    if (!db) return;
    let cancelled = false;
    void fetchCatalog(db).then((loaded) => {
      if (!cancelled) setRows(loaded);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return rows;
}

export function useCatalogBikes(): CatalogBikes {
  const rows = useCatalogRows();
  return useMemo(() => bikesFromCatalog(rows), [rows]);
}

/** Whether the signed in user may moderate the catalog (asked of the database; false for a guest and on any failure). */
export function useIsAdmin(): boolean {
  const auth = useAuth();
  const getDb = useCatalogDb();
  const [admin, setAdmin] = useState(false);
  const signedIn = auth.status === 'authenticated';
  const userId = auth.user?.id ?? null;
  useEffect(() => {
    const db = getDb();
    if (!signedIn || !db) return;
    let cancelled = false;
    void fetchIsAdmin(db).then((result) => {
      if (!cancelled) setAdmin(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, userId]);
  return signedIn && admin;
}

export type AdminStatus = 'checking' | 'admin' | 'denied';

/** Whether the page of the owner may be shown: asked of the database (`is_admin()`), never decided in the browser. */
export function useAdminStatus(): AdminStatus {
  const auth = useAuth();
  const getDb = useCatalogDb();
  const [answer, setAnswer] = useState<{ userId: string; admin: boolean } | null>(null);
  const userId = auth.user?.id ?? null;
  useEffect(() => {
    const db = getDb();
    if (auth.status !== 'authenticated' || !db || !userId) return;
    let cancelled = false;
    void fetchIsAdmin(db).then((admin) => {
      if (!cancelled) setAnswer({ userId, admin });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, userId]);
  if (auth.status === 'loading') return 'checking';
  if (auth.status !== 'authenticated') return 'denied';
  if (answer?.userId !== userId) return 'checking';
  return answer.admin ? 'admin' : 'denied';
}
