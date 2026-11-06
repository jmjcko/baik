import type { BikeBook, IntervalsPairing, LoggedRide } from '@/types/service';
import type { IntervalsRide } from './activities';
import { claims } from './rule';

export const isIntervalsRide = (ride: LoggedRide): boolean => ride.id.startsWith('icu-');

const withoutIntervals = (rides: LoggedRide[]): LoggedRide[] => rides.filter((ride) => !isIntervalsRide(ride));

const sameRule = (a: IntervalsPairing, b: Pick<IntervalsPairing, 'gearId' | 'types'>): boolean => a.gearId === b.gearId && a.types.join() === b.types.join();

/** Sets the rule of the bike; the rides loaded under another rule are removed (the next update loads the right ones). */
export function pairIntervals(book: BikeBook, rule: Pick<IntervalsPairing, 'gearId' | 'gearName' | 'types'>, since: string): BikeBook {
  const same = book.intervals !== null && sameRule(book.intervals, rule);
  return { ...book, rides: same ? book.rides : withoutIntervals(book.rides), intervals: { ...rule, since, syncedAt: same ? book.intervals?.syncedAt ?? null : null } };
}

/** Takes the rule away together with the rides that came from Intervals.icu (the rides the rider typed stay). */
export const unpairIntervals = (book: BikeBook): BikeBook => ({ ...book, rides: withoutIntervals(book.rides), intervals: null });

/** The rides of an update that this bike claims replace its earlier Intervals.icu rides; the rain ticks the rider set are kept. */
export function mergeIntervalsRides(book: BikeBook, rides: IntervalsRide[], today: string, limit: number): BikeBook {
  const pairing = book.intervals;
  if (!pairing) return book;
  const rained = new Set(book.rides.filter((ride) => isIntervalsRide(ride) && ride.rain).map((ride) => ride.id));
  const loaded: LoggedRide[] = rides.filter((ride) => claims(pairing, ride) && ride.date >= pairing.since).map((ride) => ({ id: ride.id, date: ride.date, terrain: ride.terrain, km: ride.km, elevationM: ride.elevationM, rain: rained.has(ride.id) }));
  const all = [...withoutIntervals(book.rides), ...loaded].sort((a, b) => b.date.localeCompare(a.date));
  return { ...book, rides: all.slice(0, limit), intervals: { ...pairing, syncedAt: today } };
}
