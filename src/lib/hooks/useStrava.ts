'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { clearStravaEverywhere, pairedElsewhere } from '@/lib/service/bookStore';
import type { StravaBike } from '@/lib/strava/activities';
import { disconnectStrava, fetchStravaBikes, fetchStravaRides, type StravaFailure } from '@/lib/strava/api';
import { mergeStravaRides, pairBike, unpairBike } from '@/lib/strava/book';
import { BOOK_LIMITS, type BikeBook } from '@/types/service';

export type StravaStatus = 'checking' | 'guest' | 'unavailable' | 'disconnected' | 'connected';

export type StravaNotice = { kind: 'synced'; n: number } | { kind: 'truncated' } | { kind: 'taken' } | { kind: 'error'; code: StravaFailure };

interface StatusDatabase {
  from: (table: 'strava_connections') => { select: (columns: string) => PromiseLike<{ data: unknown; error: unknown }> };
}

/** Whether the signed in rider has a Strava connection (the row of the table, which row level security shows only to its owner). */
function useConnection() {
  const auth = useAuth();
  const [connected, setConnected] = useState<boolean | null>(null);
  const userId = auth.user?.id ?? null;
  useEffect(() => {
    const db = auth.getDatabase() as unknown as StatusDatabase | null;
    if (auth.status !== 'authenticated' || !db) return;
    let cancelled = false;
    void db.from('strava_connections').select('athlete_id').then(({ data, error }) => {
      if (!cancelled) setConnected(error ? false : Array.isArray(data) && data.length > 0);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, userId]);
  const status: StravaStatus = auth.status === 'loading' ? 'checking' : auth.status !== 'authenticated' ? 'guest' : !auth.configured ? 'unavailable' : connected === null ? 'checking' : connected ? 'connected' : 'disconnected';
  return { status, setConnected };
}

type Update = (change: (book: BikeBook) => BikeBook) => void;

/** The jobs of the card: one runs at a time, and its result is a notice. */
function useJobs() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<StravaNotice | null>(null);
  const run = useCallback(async (job: () => Promise<StravaNotice | null>) => {
    setBusy(true);
    setNotice(await job());
    setBusy(false);
  }, []);
  return { busy, notice, setNotice, run };
}

/** Loads the rides of a Strava bike into the book of this bike. */
function useSync(update: Update, today: string, run: ReturnType<typeof useJobs>['run']) {
  return (gearId: string, since: string) => run(async () => {
    const answer = await fetchStravaRides(gearId, since);
    if (!answer.ok) return { kind: 'error', code: answer.error };
    update((book) => mergeStravaRides(book, answer.rides, today, BOOK_LIMITS.rides));
    return answer.truncated ? { kind: 'truncated' } : { kind: 'synced', n: answer.rides.length };
  });
}

/** The Strava card of one bike: the connection, the pairing with a Strava bike, the update of the rides and the disconnect. */
export function useStrava(bikeId: string, update: Update, today: string) {
  const { status, setConnected } = useConnection();
  const { busy, notice, setNotice, run } = useJobs();
  const [bikes, setBikes] = useState<StravaBike[] | null>(null);
  const sync = useSync(update, today, run);
  const loadBikes = () => run(async () => {
    const answer = await fetchStravaBikes();
    if (answer.ok) setBikes(answer.bikes);
    return answer.ok ? null : { kind: 'error', code: answer.error };
  });
  const pair = async (bike: StravaBike, since: string) => {
    if (pairedElsewhere(bike.id, bikeId)) return setNotice({ kind: 'taken' });
    update((book) => pairBike(book, bike, since));
    await sync(bike.id, since);
  };
  const disconnect = () => run(async () => {
    const answer = await disconnectStrava();
    if (!answer.ok) return { kind: 'error', code: answer.error };
    clearStravaEverywhere();
    update(unpairBike);
    setConnected(false);
    setBikes(null);
    return null;
  });
  return { status, bikes, busy, notice, sync, loadBikes, pair, disconnect, unpair: () => update(unpairBike) };
}
