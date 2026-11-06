'use client';

import { useCallback, useState } from 'react';
import { clearIntervalsEverywhere, intervalsOverlapElsewhere } from '@/lib/service/bookStore';
import { gearsOf } from '@/lib/intervals/activities';
import { fetchIntervalsRides, type IntervalsCreds, type IntervalsFailure } from '@/lib/intervals/api';
import { mergeIntervalsRides, pairIntervals, unpairIntervals } from '@/lib/intervals/book';
import { forgetCreds, loadCreds, saveCreds } from '@/lib/intervals/keyStore';
import { BOOK_LIMITS, type BikeBook, type IntervalsPairing } from '@/types/service';

export type IntervalsNotice = { kind: 'synced'; n: number } | { kind: 'overlap' } | { kind: 'noTypes' } | { kind: 'error'; code: IntervalsFailure };

type Update = (change: (book: BikeBook) => BikeBook) => void;
type Rule = Pick<IntervalsPairing, 'gearId' | 'gearName' | 'types'>;
export type Gear = { id: string; name: string };

/** One job runs at a time and its result is a notice. */
function useJobs() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<IntervalsNotice | null>(null);
  const run = useCallback(async (job: () => Promise<IntervalsNotice | null>) => {
    setBusy(true);
    setNotice(await job());
    setBusy(false);
  }, []);
  return { busy, notice, setNotice, run };
}

/** The key of the rider (kept in this browser), the bikes of Intervals.icu found on the rides, the connection and the update of the rides. */
function useConnection(update: Update, today: string) {
  const [creds, setCreds] = useState<IntervalsCreds | null>(() => loadCreds());
  const [gears, setGears] = useState<Gear[] | null>(null);
  const jobs = useJobs();
  const connect = (next: IntervalsCreds, since: string) => jobs.run(async () => {
    const answer = await fetchIntervalsRides(next, since, today);
    if (!answer.ok) return { kind: 'error', code: answer.error };
    saveCreds(next);
    setCreds(next);
    setGears(gearsOf(answer.rides));
    return null;
  });
  const sync = (since: string) => jobs.run(async () => {
    const answer = creds ? await fetchIntervalsRides(creds, since, today) : null;
    if (!answer || !answer.ok) return { kind: 'error', code: answer ? answer.error : 'unauthorized' };
    update((book) => mergeIntervalsRides(book, answer.rides, today, BOOK_LIMITS.rides));
    return { kind: 'synced', n: answer.rides.length };
  });
  return { creds, setCreds, gears, setGears, ...jobs, connect, sync };
}

/** The card of one bike: connect with a key, choose which rides count for the bike, update, change the rule and forget the key. */
export function useIntervals(bikeId: string, update: Update, today: string) {
  const c = useConnection(update, today);
  const pair = async (rule: Rule, since: string) => {
    if (rule.types.length === 0 && rule.gearId === null) return c.setNotice({ kind: 'noTypes' });
    if (intervalsOverlapElsewhere(rule, bikeId)) return c.setNotice({ kind: 'overlap' });
    update((book) => pairIntervals(book, rule, since));
    await c.sync(since);
  };
  const forget = () => {
    forgetCreds();
    clearIntervalsEverywhere();
    update(unpairIntervals);
    [c.setCreds, c.setGears].forEach((set) => set(null));
    c.setNotice(null);
  };
  return { creds: c.creds, gears: c.gears, busy: c.busy, notice: c.notice, connect: c.connect, sync: c.sync, pair, forget, unpair: () => update(unpairIntervals) };
}
