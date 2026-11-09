import { BOOK_LIMITS, type BikeBook } from '@/types/service';
import type { StoredBook } from './bookStore';

/** A book of the account. */
export interface RemoteBook {
  bikeId: string;
  book: BikeBook;
  updatedAt: string;
}

/** The book as it goes to the account: the frame number, the insurance number and the photo stay in this browser. */
export const forAccount = (book: BikeBook): BikeBook => ({ ...book, identity: { ...book.identity, serial: '', insurance: '', photo: null } });

/** The book of the account with what only this browser holds (frame number, insurance number, photo) put back. */
export const fromAccount = (remote: BikeBook, local: BikeBook): BikeBook => ({ ...remote, identity: { ...remote.identity, serial: local.identity.serial, insurance: local.identity.insurance, photo: local.identity.photo } });

const byId = <T extends { id: string }>(first: T[], second: T[]): T[] => [...new Map([...first, ...second].map((item) => [item.id, item])).values()];

/**
 * Both books put together, for a book of this browser whose time is not known (it was written before the times were kept) and that the account
 * has too: nothing of either is lost. The entries and the rides of both are kept, the settings of the account win.
 */
export function unionBooks(local: BikeBook, remote: BikeBook): BikeBook {
  const wearDone = { ...local.wearDone };
  for (const [part, day] of Object.entries(remote.wearDone)) {
    const key = part as keyof BikeBook['wearDone'];
    if (!wearDone[key] || (day as string) > (wearDone[key] as string)) wearDone[key] = day;
  }
  return {
    ...remote,
    identity: { ...remote.identity, make: remote.identity.make || local.identity.make, model: remote.identity.model || local.identity.model, year: remote.identity.year ?? local.identity.year },
    log: byId(remote.log, local.log).sort((a, b) => b.at.localeCompare(a.at)).slice(0, BOOK_LIMITS.entries),
    rides: byId(remote.rides, local.rides).sort((a, b) => b.date.localeCompare(a.date)).slice(0, BOOK_LIMITS.rides),
    wearDone,
    strava: remote.strava ?? local.strava,
    intervals: remote.intervals ?? local.intervals,
  };
}

/** What the merge does for one bike: take the book of the account, send this browser's book, put both together and send the result, or nothing. */
export type MergeAction = 'pull' | 'push' | 'merge' | 'same';

export interface MergeStep {
  bikeId: string;
  action: MergeAction;
}

const sameBook = (local: BikeBook, remote: BikeBook): boolean => JSON.stringify(forAccount(local)) === JSON.stringify(forAccount(remote));

function stepFor(local: StoredBook | undefined, remote: RemoteBook | undefined): MergeAction {
  if (!local) return 'pull';
  if (!remote) return 'push';
  if (sameBook(local.book, remote.book)) return 'same';
  if (local.updatedAt === null) return 'merge';
  const difference = Date.parse(remote.updatedAt) - Date.parse(local.updatedAt);
  return difference > 0 ? 'pull' : difference < 0 ? 'push' : 'same';
}

/** Compares the books of this browser with the books of the account, bike by bike: the later change wins, and a book of unknown time is put together with the account's. */
export function planMerge(local: StoredBook[], remote: RemoteBook[]): MergeStep[] {
  const ids = [...new Set([...local.map((one) => one.bikeId), ...remote.map((one) => one.bikeId)])];
  return ids.map((bikeId) => ({ bikeId, action: stepFor(local.find((one) => one.bikeId === bikeId), remote.find((one) => one.bikeId === bikeId)) }));
}
