import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { rulesOverlap } from '@/lib/intervals/rule';
import { isEmptyBook, parseBook } from './parseBook';

/** LocalStorage key of the books of the bikes. The browser always keeps them; for a signed in rider they are also kept in the account (bookSync, story 55.3). */
export const BOOK_STORAGE_KEY = 'baik_bike_book';

const BOOK_VERSION = 1;

type Books = Record<string, unknown>;
/** The day and time of the last change of each book of this browser (what the merge with the account compares). */
type Times = Record<string, string>;

interface Envelope {
  bikes: Books;
  times: Times;
}

const isTime = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value));

function readEnvelope(): Envelope {
  try {
    const raw = window.localStorage.getItem(BOOK_STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as { version?: number; bikes?: Books; times?: Record<string, unknown> } | null) : null;
    if (data?.version !== BOOK_VERSION || !data.bikes || typeof data.bikes !== 'object') return { bikes: {}, times: {} };
    const times = Object.fromEntries(Object.entries(data.times ?? {}).filter((entry): entry is [string, string] => isTime(entry[1])));
    return { bikes: data.bikes, times };
  } catch {
    return { bikes: {}, times: {} };
  }
}

const readAll = (): Books => readEnvelope().bikes;

const listeners = new Set<(bikeIds: string[]) => void>();
const appliedListeners = new Set<() => void>();
let appliedRevision = 0;

/** Writes the envelope; throws when the browser storage refuses (the callers report false). */
function writeEnvelope({ bikes, times }: Envelope): void {
  window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: BOOK_VERSION, bikes, times }));
}

/** Called after every change that the rider (or a clearing of a connection) made to the books of this browser, with the bikes that changed. */
export function subscribeBooks(listener: (bikeIds: string[]) => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** Called after a book of the account was taken into this browser: a screen that shows a book reads it again. */
export function subscribeAppliedBooks(listener: () => void): () => void {
  appliedListeners.add(listener);
  return () => void appliedListeners.delete(listener);
}

export const appliedBooksRevision = (): number => appliedRevision;

/** The book of a bike; an empty book when nothing is stored or the storage is not available. */
export function loadBook(bikeId: string): BikeBook {
  if (typeof window === 'undefined') return parseBook(null);
  const bikes = readAll();
  return parseBook(Object.prototype.hasOwnProperty.call(bikes, bikeId) ? bikes[bikeId] : DEFAULT_BOOK);
}

/** Stores the book of a bike (an empty one removes it) and notes the time of the change; false when the browser storage is not available or full. */
export function saveBook(bikeId: string, book: BikeBook, now: Date = new Date()): boolean {
  try {
    const { bikes, times } = readEnvelope();
    if (isEmptyBook(book)) delete bikes[bikeId];
    else bikes[bikeId] = book;
    times[bikeId] = now.toISOString();
    writeEnvelope({ bikes, times });
    listeners.forEach((listener) => listener([bikeId]));
    return true;
  } catch {
    return false;
  }
}

/** A book of this browser with the time of its last change (null for a book that was written before the times were kept). */
export interface StoredBook {
  bikeId: string;
  book: BikeBook;
  updatedAt: string | null;
}

/** Every book of this browser, also a book that was emptied (its time says so, and the account must hear of it). */
export function listBooks(): StoredBook[] {
  if (typeof window === 'undefined') return [];
  const { bikes, times } = readEnvelope();
  return [...new Set([...Object.keys(bikes), ...Object.keys(times)])].map((bikeId) => ({ bikeId, book: loadBook(bikeId), updatedAt: times[bikeId] ?? null }));
}

/** Notes the time of a book that the account has just been sent, without telling the listeners (the book itself did not change). */
export function stampBook(bikeId: string, updatedAt: string): boolean {
  try {
    const { bikes, times } = readEnvelope();
    times[bikeId] = updatedAt;
    writeEnvelope({ bikes, times });
    return true;
  } catch {
    return false;
  }
}

/** Takes a book of the account into this browser with the time the account gives it; nothing is sent back for it. */
export function applyRemoteBook(bikeId: string, book: BikeBook, updatedAt: string): boolean {
  try {
    const { bikes, times } = readEnvelope();
    if (isEmptyBook(book)) delete bikes[bikeId];
    else bikes[bikeId] = book;
    times[bikeId] = updatedAt;
    writeEnvelope({ bikes, times });
    appliedRevision += 1;
    appliedListeners.forEach((listener) => listener());
    return true;
  } catch {
    return false;
  }
}

/** Forgets every book of this browser (sign out, or the rider erased the stored data). */
export function clearAllBooks(): void {
  try {
    window.localStorage.removeItem(BOOK_STORAGE_KEY);
  } catch {
    /* nothing stored, nothing to remove */
  }
  appliedRevision += 1;
  appliedListeners.forEach((listener) => listener());
}

/** Whether a Strava bike is already paired with another bike of this browser (one Strava bike belongs to one bike). */
export function pairedElsewhere(gearId: string, exceptBikeId: string): boolean {
  if (typeof window === 'undefined') return false;
  return Object.entries(readAll()).some(([bikeId, raw]) => bikeId !== exceptBikeId && parseBook(raw).strava?.gearId === gearId);
}

/** Rewrites the books that `change` returns a new book for, notes their time and tells the listeners; false when the storage refuses. */
function rewrite(change: (bikeId: string, book: BikeBook) => BikeBook | null): boolean {
  try {
    const { bikes, times } = readEnvelope();
    const now = new Date().toISOString();
    const changed: string[] = [];
    for (const [bikeId, raw] of Object.entries(bikes)) {
      const next = change(bikeId, parseBook(raw));
      if (next) {
        bikes[bikeId] = next;
        times[bikeId] = now;
        changed.push(bikeId);
      }
    }
    writeEnvelope({ bikes, times });
    if (changed.length > 0) listeners.forEach((listener) => listener(changed));
    return true;
  } catch {
    return false;
  }
}

/** Removes every Strava pairing and every ride that came from Strava from the books of this browser (the rider disconnected Strava). */
export function clearStravaEverywhere(): boolean {
  return rewrite((_bikeId, book) => (book.strava ? { ...book, strava: null, rides: book.rides.filter((ride) => !ride.id.startsWith('strava-')) } : null));
}

/** Whether another bike counts rides that the rule would count as well (they would be counted twice). Only the bikes of one rider count when `bikeIds` is given: another rider has their own Intervals.icu account. */
export function intervalsOverlapElsewhere(rule: { gearId: string | null; types: Array<'road' | 'gravel' | 'mtb' | 'trainer'> }, exceptBikeId: string, bikeIds?: string[]): boolean {
  if (typeof window === 'undefined') return false;
  return Object.entries(readAll()).some(([bikeId, raw]) => {
    const other = bikeId === exceptBikeId || (bikeIds && !bikeIds.includes(bikeId)) ? null : parseBook(raw).intervals;
    return other !== null && rulesOverlap(rule, other);
  });
}

/** Removes every Intervals.icu rule and every ride that came from Intervals.icu from the books of this browser, or only from the books of the given bikes (the rider forgot the key). */
export function clearIntervalsEverywhere(bikeIds?: string[]): boolean {
  return rewrite((bikeId, book) => (book.intervals && (!bikeIds || bikeIds.includes(bikeId)) ? { ...book, intervals: null, rides: book.rides.filter((ride) => !ride.id.startsWith('icu-')) } : null));
}
