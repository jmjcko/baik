import type { SupabaseClient } from '@supabase/supabase-js';
import { stateOf } from '@/lib/consent/consentStore';
import { fetchRemoteConsents, type ConsentDatabase } from '@/lib/consent/consentRemote';
import { fetchIntervalsRides } from '@/lib/intervals/api';
import { mergeIntervalsRides } from '@/lib/intervals/book';
import type { IntervalsConfig } from '@/lib/intervals/config';
import { loadCreds, markSynced } from '@/lib/intervals/connection';
import { fetchRemoteBooks, type BookDatabase } from '@/lib/service/bookRemote';
import type { RemoteBook } from '@/lib/service/bookSync';
import { BOOK_LIMITS } from '@/types/service';

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface RunDeps {
  db: SupabaseClient;
  config: IntervalsConfig;
  fetcher: Fetcher;
  now: () => number;
  /** The run stops taking new riders after this many milliseconds (the function of the host is short); what is left goes first the next day. */
  budgetMs: number;
}

/** Counts only: the report never names a rider, a bike or a key. */
export interface RunReport {
  riders: number;
  booksUpdated: number;
  skipped: number;
  failed: number;
  stoppedEarly: boolean;
}

const BATCH = 100;
const today = (now: number): string => new Date(now).toISOString().slice(0, 10);

interface Connection {
  user_id: string;
  rider_id: string;
}

/** The connections that were loaded longest ago (never loaded first), at most one batch. */
async function oldestConnections(db: SupabaseClient): Promise<Connection[]> {
  const { data, error } = await db.from('intervals_connections').select('user_id, rider_id').order('last_sync_at', { ascending: true, nullsFirst: true }).limit(BATCH);
  return error || !Array.isArray(data) ? [] : (data as Connection[]);
}

/** A rider with one connection is clear; with several, the book does not say which rider it belongs to, so they are left to the app (it knows the rider). */
function singles(rows: Connection[]): { singles: Connection[]; ambiguous: number } {
  const count = new Map<string, number>();
  rows.forEach((row) => count.set(row.user_id, (count.get(row.user_id) ?? 0) + 1));
  const clear = rows.filter((row) => count.get(row.user_id) === 1);
  return { singles: clear, ambiguous: rows.length - clear.length };
}

/** Both purposes must be agreed to in the account: a withdrawn consent stops the load. */
async function mayLoad(db: SupabaseClient, userId: string): Promise<boolean> {
  const consents = await fetchRemoteConsents(db as unknown as ConsentDatabase, userId);
  return consents !== null && stateOf(consents, 'health_storage') === 'granted' && stateOf(consents, 'intervals') === 'granted';
}

/** Writes the book only if nobody changed it since it was read (the same `updated_at`), so a change made in the app meanwhile is never overwritten. */
async function writeBook(deps: RunDeps, userId: string, row: RemoteBook, data: RemoteBook['book']): Promise<boolean> {
  const { data: rows, error } = await deps.db.from('bike_books').update({ data, updated_at: new Date(deps.now()).toISOString() })
    .eq('user_id', userId).eq('bike_id', row.bikeId).eq('updated_at', row.updatedAt).select('bike_id');
  return !error && Array.isArray(rows) && rows.length === 1;
}

type Outcome = { kind: 'done'; updated: number } | { kind: 'skipped' } | { kind: 'failed' };

/** One rider: the rides since the earliest rule are read once with the stored key and merged into every bike that has an Intervals.icu rule. */
async function loadRider(deps: RunDeps, userId: string, riderId: string): Promise<Outcome> {
  if (!(await mayLoad(deps.db, userId))) return { kind: 'skipped' };
  const remote = await fetchRemoteBooks(deps.db as unknown as BookDatabase, userId);
  if (remote.status !== 'ok') return { kind: 'failed' };
  const paired = remote.books.filter((one) => one.book.intervals !== null);
  if (paired.length === 0) return { kind: 'skipped' };
  const stored = await loadCreds(deps.db, userId, riderId, deps.config);
  if (stored.status !== 'ok') return { kind: 'failed' };
  const since = paired.map((one) => one.book.intervals?.since ?? '').sort()[0];
  const answer = await fetchIntervalsRides(stored.creds, since, today(deps.now()), deps.fetcher);
  if (!answer.ok) return { kind: 'failed' };
  let updated = 0;
  for (const one of paired) {
    const merged = mergeIntervalsRides(one.book, answer.rides, today(deps.now()), BOOK_LIMITS.rides);
    if (JSON.stringify(merged.rides) !== JSON.stringify(one.book.rides) && (await writeBook(deps, userId, one, merged))) updated += 1;
  }
  return { kind: 'done', updated };
}

/** The daily run: the oldest connections first, one rider at a time, a failure of one rider never stops the others. Every rider that was tried moves to the back of the queue, so a rider who fails every day cannot starve the rest. */
export async function runRides(deps: RunDeps): Promise<RunReport> {
  const started = deps.now();
  const { singles: riders, ambiguous } = singles(await oldestConnections(deps.db));
  const report: RunReport = { riders: 0, booksUpdated: 0, skipped: ambiguous, failed: 0, stoppedEarly: false };
  for (const rider of riders) {
    if (deps.now() - started > deps.budgetMs) return { ...report, stoppedEarly: true };
    const outcome = await loadRider(deps, rider.user_id, rider.rider_id).catch((): Outcome => ({ kind: 'failed' }));
    await markSynced(deps.db, rider.user_id, rider.rider_id);
    report.riders += 1;
    if (outcome.kind === 'done') report.booksUpdated += outcome.updated;
    else if (outcome.kind === 'skipped') report.skipped += 1;
    else report.failed += 1;
  }
  return report;
}
