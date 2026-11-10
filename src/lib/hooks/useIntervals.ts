'use client';

import { useCallback, useState } from 'react';
import { clearIntervalsEverywhere, intervalsOverlapElsewhere } from '@/lib/service/bookStore';
import { gearsOf, type IntervalsRide } from '@/lib/intervals/activities';
import { fetchIntervalsRides, type IntervalsAnswer, type IntervalsCreds, type IntervalsFailure } from '@/lib/intervals/api';
import { connectOnServer, disconnectOnServer, syncOnServer, toFailure, type ServerAnswer } from '@/lib/intervals/serverApi';
import { useIntervalsLink } from './useIntervalsLink';
import { mergeIntervalsRides, pairIntervals, unpairIntervals } from '@/lib/intervals/book';
import { DEFAULT_RIDER, forgetCreds, loadCreds, saveCreds } from '@/lib/intervals/keyStore';
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

/** Whose Intervals.icu it is: the rider of the bike and the bikes of that rider (the key, the overlap of the rules and forgetting all belong to one rider). */
export interface IntervalsScope {
  riderId: string;
  /** The bikes of the rider; the books of other bikes are never touched. Left out, every bike of the browser counts. */
  bikeIds?: string[];
  /** The bike is already paired: it was paired with the key of the first version, which this rider then takes over. */
  adopt?: boolean;
}

interface Ctx {
  scope: IntervalsScope;
  today: string;
  link: ReturnType<typeof useIntervalsLink>;
  creds: IntervalsCreds | null;
  setCreds: (creds: IntervalsCreds | null) => void;
  setGears: (gears: Gear[] | null) => void;
}

/** Connects: with the account the key goes to the server once and is forgotten here; without the account (or a server that is not set up) it stays in this browser. */
async function runConnect(ctx: Ctx, next: IntervalsCreds, since: string): Promise<IntervalsNotice | null> {
  const { scope, today, link } = ctx;
  if (link.usable) {
    const answer = await connectOnServer(scope.riderId, next, since, today);
    if (answer.ok) {
      forgetCreds(scope.riderId);
      ctx.setCreds(null);
      link.setConnected(true);
      ctx.setGears(gearsOf(answer.rides));
      return null;
    }
    if (answer.error !== 'not_configured') return { kind: 'error', code: toFailure(answer.error) };
  }
  const answer = await fetchIntervalsRides(next, since, today);
  if (!answer.ok) return { kind: 'error', code: answer.error };
  saveCreds(next, scope.riderId);
  ctx.setCreds(next);
  ctx.setGears(gearsOf(answer.rides));
  return null;
}

/** The rides of a window: asked of the server when the key is in the account, read by the browser with the key of the browser otherwise. */
async function ridesOf(ctx: Ctx, since: string): Promise<IntervalsAnswer | null> {
  if (ctx.link.status === 'connected') return fromServer(await syncOnServer(ctx.scope.riderId, since, ctx.today));
  return ctx.creds ? fetchIntervalsRides(ctx.creds, since, ctx.today) : null;
}

/** The key of the rider: kept in this browser (a guest) or encrypted in the account (a signed in rider, read only by the server). */
function useConnection(update: Update, today: string, scope: IntervalsScope) {
  const link = useIntervalsLink(scope.riderId);
  const [creds, setCreds] = useState<IntervalsCreds | null>(() => loadCreds(scope.riderId, scope.adopt));
  const [gears, setGears] = useState<Gear[] | null>(null);
  const jobs = useJobs();
  const ctx: Ctx = { scope, today, link, creds, setCreds, setGears };
  const load = (since: string, then: (rides: IntervalsRide[]) => IntervalsNotice | null) => jobs.run(async () => {
    const answer = await ridesOf(ctx, since);
    return !answer || !answer.ok ? { kind: 'error', code: answer ? answer.error : 'unauthorized' } : then(answer.rides);
  });
  const loadGears = (since: string) => load(since, (rides) => (setGears(gearsOf(rides)), null));
  const sync = (since: string) => load(since, (rides) => (update((book) => mergeIntervalsRides(book, rides, today, BOOK_LIMITS.rides)), { kind: 'synced', n: rides.length }));
  return { creds, setCreds, gears, setGears, link, viaServer: link.status === 'connected', ...jobs, connect: (next: IntervalsCreds, since: string) => jobs.run(() => runConnect(ctx, next, since)), loadGears, sync };
}

const fromServer = (answer: ServerAnswer): IntervalsAnswer => (answer.ok ? answer : { ok: false, error: toFailure(answer.error) });

/** The card of one bike: connect with a key, choose which rides count for the bike, update, change the rule and forget the key. */
export function useIntervals(bikeId: string, update: Update, today: string, scope: IntervalsScope = { riderId: DEFAULT_RIDER }) {
  const c = useConnection(update, today, scope);
  const pair = async (rule: Rule, since: string) => {
    if (rule.types.length === 0 && rule.gearId === null) return c.setNotice({ kind: 'noTypes' });
    if (intervalsOverlapElsewhere(rule, bikeId, scope.bikeIds)) return c.setNotice({ kind: 'overlap' });
    update((book) => pairIntervals(book, rule, since));
    await c.sync(since);
  };
  const forget = () => c.run(async () => {
    if (c.viaServer && !(await disconnectOnServer(scope.riderId))) return { kind: 'error', code: 'unavailable' };
    c.link.setConnected(false);
    forgetCreds(scope.riderId);
    clearIntervalsEverywhere(scope.bikeIds);
    update(unpairIntervals);
    [c.setCreds, c.setGears].forEach((set) => set(null));
    return null;
  });
  const connected = c.viaServer || c.creds !== null;
  /** A key that is still in this browser can be moved to the account (a signed in rider, server set up). */
  const canMove = c.creds !== null && !c.viaServer && c.link.usable;
  return { creds: c.creds, connected, viaServer: c.viaServer, canMove, gears: c.gears, busy: c.busy, notice: c.notice, connect: c.connect, loadGears: c.loadGears, sync: c.sync, pair, forget, unpair: () => update(unpairIntervals) };
}
