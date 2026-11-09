'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useConsent } from '@/lib/consent/useConsent';
import { applyRemoteBook, clearAllBooks, listBooks, loadBook, saveBook, stampBook, subscribeBooks } from '@/lib/service/bookStore';
import { fetchRemoteBooks, saveRemoteBook, type BookDatabase } from '@/lib/service/bookRemote';
import { fromAccount, planMerge, unionBooks, type RemoteBook } from '@/lib/service/bookSync';

const SAVE_DELAY_MS = 800;

export interface BookSyncState {
  /** How many books the last sign in merge took from the account and sent to it; null before it ran or when nothing moved. */
  summary: { pulled: number; pushed: number } | null;
  /** A book could not be written to the account (it stays in this browser and is tried again at the next change). */
  failed: boolean;
}

/** Sends one book of this browser to the account; the time of a book that had none is noted first so that both sides agree. */
async function send(db: BookDatabase, userId: string, bikeId: string): Promise<boolean> {
  const stored = listBooks().find((one) => one.bikeId === bikeId);
  if (!stored) return true;
  const updatedAt = stored.updatedAt ?? new Date().toISOString();
  if (stored.updatedAt === null) stampBook(bikeId, updatedAt);
  return saveRemoteBook(db, userId, bikeId, stored.book, updatedAt);
}

/** Merges the books of this browser and of the account bike by bike; returns how many were taken and sent, and the bikes that could not be sent. */
async function mergeAccount(db: BookDatabase, userId: string, remote: RemoteBook[]): Promise<{ pulled: number; pushed: number; failed: string[] }> {
  const result = { pulled: 0, pushed: 0, failed: [] as string[] };
  const local = listBooks();
  for (const { bikeId, action } of planMerge(local, remote)) {
    const theirs = remote.find((one) => one.bikeId === bikeId);
    const mine = local.find((one) => one.bikeId === bikeId);
    if (action === 'pull' && theirs) {
      applyRemoteBook(bikeId, fromAccount(theirs.book, mine?.book ?? loadBook(bikeId)), theirs.updatedAt);
      result.pulled += 1;
    }
    if (action === 'merge' && theirs && mine) saveBook(bikeId, unionBooks(mine.book, theirs.book));
    if (action === 'push' || action === 'merge') {
      if (await send(db, userId, bikeId)) result.pushed += 1;
      else result.failed.push(bikeId);
    }
  }
  return result;
}

/** What waits to be written to the account: the bikes whose book changed in this browser and was not confirmed saved. One per app, like the browser storage. */
const dirty = new Set<string>();

/** Forgets what waits to be written (tests start from a clean browser). */
export function resetBookSync(): void {
  dirty.clear();
}

type Report = (next: (before: BookSyncState) => BookSyncState) => void;

/** Sign in: the books of this browser and of the account are merged and the outcome is reported. */
function useMergeAtSignIn(userId: string | null, getDatabase: () => unknown, report: Report): void {
  useEffect(() => {
    const db = userId ? (getDatabase() as BookDatabase | null) : null;
    if (!userId || !db) return;
    let live = true;
    void (async () => {
      const remote = await fetchRemoteBooks(db, userId);
      if (!live || remote.status !== 'ok') return;
      const done = await mergeAccount(db, userId, remote.books);
      if (!live) return;
      done.failed.forEach((bikeId) => dirty.add(bikeId));
      report(() => ({ summary: done.pulled + done.pushed > 0 ? { pulled: done.pulled, pushed: done.pushed } : null, failed: done.failed.length > 0 }));
    })();
    return () => { live = false; };
  }, [userId, getDatabase, report]);
}

/** Every change of a book is written to the account after a short delay; a failed write stays on the list for the next change. */
function useAutosave(userId: string | null, getDatabase: () => unknown, report: Report): void {
  useEffect(() => {
    const db = userId ? (getDatabase() as BookDatabase | null) : null;
    if (!userId || !db) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = async () => {
      const results = await Promise.all([...dirty].map(async (bikeId) => [bikeId, await send(db, userId, bikeId)] as const));
      results.forEach(([bikeId, ok]) => ok && dirty.delete(bikeId));
      report((before) => ({ ...before, failed: results.some(([, ok]) => !ok) }));
    };
    const unsubscribe = subscribeBooks((bikeIds) => {
      bikeIds.forEach((bikeId) => dirty.add(bikeId));
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
    });
    return () => { unsubscribe(); clearTimeout(timer); };
  }, [userId, getDatabase, report]);
}

/** Sign out: the books of the account leave this browser (the next rider of the device starts clean), unless one is still waiting to be saved. */
function useClearAtSignOut(status: string): void {
  const was = useRef(false);
  useEffect(() => {
    if (status === 'authenticated') was.current = true;
    else if (status === 'anonymous' && was.current) {
      was.current = false;
      if (dirty.size === 0) clearAllBooks();
      dirty.clear();
    }
  }, [status]);
}

/**
 * Keeps the service books of a signed in rider in the account (story 55.3): at sign in the books of this browser and of the account are
 * merged bike by bike (the later change wins; a book of unknown time is put together with the account's, so nothing is lost), then every
 * change is written after a short delay. A rider who withdrew the consent to the storage in the account keeps the books in the browser only.
 */
export function useBookSync(): BookSyncState {
  const { status, user, getDatabase } = useAuth();
  const allowed = useConsent('health_storage').state !== 'declined';
  const userId = status === 'authenticated' && allowed ? (user?.id ?? null) : null;
  const [state, setState] = useState<BookSyncState>({ summary: null, failed: false });
  useMergeAtSignIn(userId, getDatabase, setState);
  useAutosave(userId, getDatabase, setState);
  useClearAtSignOut(status);
  return state;
}
