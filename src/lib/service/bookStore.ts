import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { isEmptyBook, parseBook } from './parseBook';

/** LocalStorage key of the books of the bikes. They live only in this browser: signing in never copies them to the account. */
export const BOOK_STORAGE_KEY = 'baik_bike_book';

const BOOK_VERSION = 1;

type Books = Record<string, unknown>;

function readAll(): Books {
  try {
    const raw = window.localStorage.getItem(BOOK_STORAGE_KEY);
    const envelope = raw ? (JSON.parse(raw) as { version?: number; bikes?: Books } | null) : null;
    return envelope?.version === BOOK_VERSION && envelope.bikes && typeof envelope.bikes === 'object' ? envelope.bikes : {};
  } catch {
    return {};
  }
}

/** The book of a bike; an empty book when nothing is stored or the storage is not available. */
export function loadBook(bikeId: string): BikeBook {
  if (typeof window === 'undefined') return parseBook(null);
  const bikes = readAll();
  return parseBook(Object.prototype.hasOwnProperty.call(bikes, bikeId) ? bikes[bikeId] : DEFAULT_BOOK);
}

/** Stores the book of a bike (an empty one removes it); false when the browser storage is not available or full. */
export function saveBook(bikeId: string, book: BikeBook): boolean {
  try {
    const bikes = readAll();
    if (isEmptyBook(book)) delete bikes[bikeId];
    else bikes[bikeId] = book;
    window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: BOOK_VERSION, bikes }));
    return true;
  } catch {
    return false;
  }
}

/** Whether a Strava bike is already paired with another bike of this browser (one Strava bike belongs to one bike). */
export function pairedElsewhere(gearId: string, exceptBikeId: string): boolean {
  if (typeof window === 'undefined') return false;
  return Object.entries(readAll()).some(([bikeId, raw]) => bikeId !== exceptBikeId && parseBook(raw).strava?.gearId === gearId);
}

/** Removes every Strava pairing and every ride that came from Strava from the books of this browser (the rider disconnected Strava). */
export function clearStravaEverywhere(): boolean {
  try {
    const bikes = readAll();
    for (const [bikeId, raw] of Object.entries(bikes)) {
      const book = parseBook(raw);
      if (book.strava) bikes[bikeId] = { ...book, strava: null, rides: book.rides.filter((ride) => !ride.id.startsWith('strava-')) };
    }
    window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: BOOK_VERSION, bikes }));
    return true;
  } catch {
    return false;
  }
}
