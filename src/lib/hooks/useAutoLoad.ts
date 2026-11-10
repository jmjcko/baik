'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { dueForAutoLoad, markAutoLoaded } from '@/lib/service/autoLoadStore';
import { fetchIntervalsRides } from '@/lib/intervals/api';
import { syncOnServer } from '@/lib/intervals/serverApi';
import { mergeIntervalsRides } from '@/lib/intervals/book';
import { loadCreds } from '@/lib/intervals/keyStore';
import { fetchStravaRides } from '@/lib/strava/api';
import { mergeStravaRides } from '@/lib/strava/book';
import { BOOK_LIMITS, type BikeBook } from '@/types/service';

export type AutoSource = 'strava' | 'intervals';
export interface AutoLoaded {
  n: number;
  source: AutoSource;
}

type Update = (change: (book: BikeBook) => BikeBook) => void;

const newOnes = (ids: string[], known: Set<string>): number => ids.filter((id) => !known.has(id)).length;

/** Loads the rides of a bike paired with Strava (the server holds the login), or null when nothing could be loaded. */
async function loadStrava(book: BikeBook, update: Update, today: string): Promise<AutoLoaded | null> {
  if (!book.strava) return null;
  const answer = await fetchStravaRides(book.strava.gearId, book.strava.since);
  if (!answer.ok) return null;
  const known = new Set(book.rides.map((ride) => ride.id));
  update((current) => mergeStravaRides(current, answer.rides, today, BOOK_LIMITS.rides));
  return { n: newOnes(answer.rides.map((ride) => ride.id), known), source: 'strava' };
}

/** Loads the rides of a bike with an Intervals.icu rule: with the key of this browser, or, for a signed in rider, with the key in the account. */
async function loadIntervals(book: BikeBook, update: Update, today: string, riderId: string, signedIn: boolean): Promise<AutoLoaded | null> {
  const rule = book.intervals;
  const creds = loadCreds(riderId);
  if (!rule || (!creds && !signedIn)) return null;
  const answer = creds ? await fetchIntervalsRides(creds, rule.since, today) : await syncOnServer(riderId, rule.since, today);
  if (!answer.ok) return null;
  const known = new Set(book.rides.map((ride) => ride.id));
  update((current) => mergeIntervalsRides(current, answer.rides, today, BOOK_LIMITS.rides));
  return { n: newOnes(answer.rides.map((ride) => ride.id), known), source: 'intervals' };
}

/**
 * When the garage opens, the rides of the paired services load by themselves, at most every few hours on this device (the book is also kept in the
 * account, so what one device loads shows on the others). A failure is silent: the card of the service says what is wrong when the rider opens it.
 * Returns what came in, for a short notice.
 */
export function useAutoLoad(bikeId: string, book: BikeBook, update: Update, today: string, riderId: string): AutoLoaded[] {
  const { status } = useAuth();
  const [loaded, setLoaded] = useState<AutoLoaded[]>([]);
  const tried = useRef(new Set<string>());
  const latest = useRef(book);
  useEffect(() => { latest.current = book; });
  const paired = Boolean(book.strava) || Boolean(book.intervals);
  useEffect(() => {
    if (!paired || status === 'loading' || tried.current.has(bikeId) || !dueForAutoLoad(bikeId)) return;
    tried.current.add(bikeId);
    markAutoLoaded(bikeId);
    const signedIn = status === 'authenticated';
    void (async () => {
      const current = latest.current;
      const results = await Promise.all([signedIn ? loadStrava(current, update, today) : null, loadIntervals(current, update, today, riderId, signedIn)]);
      setLoaded(results.filter((one): one is AutoLoaded => one !== null && one.n > 0));
    })();
  }, [bikeId, paired, status, update, today, riderId]);
  return loaded;
}
