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
