import type { BikeBook, LoggedRide } from '@/types/service';
import type { StravaRide } from './activities';

export const isStravaRide = (ride: LoggedRide): boolean => ride.id.startsWith('strava-');

const withoutStrava = (rides: LoggedRide[]): LoggedRide[] => rides.filter((ride) => !isStravaRide(ride));

/** Pairs the book with a Strava bike; the rides of another Strava bike that were loaded before are removed. */
export function pairBike(book: BikeBook, bike: { id: string; name: string }, since: string): BikeBook {
  const same = book.strava?.gearId === bike.id;
  return { ...book, rides: same ? book.rides : withoutStrava(book.rides), strava: { gearId: bike.id, gearName: bike.name, since, syncedAt: same ? book.strava?.syncedAt ?? null : null } };
}

/** Takes the pairing away together with the rides that came from Strava (the rides the rider typed stay). */
export const unpairBike = (book: BikeBook): BikeBook => ({ ...book, rides: withoutStrava(book.rides), strava: null });

/**
 * The rides of an update replace the earlier Strava rides of the book; what the rider typed stays, and the tick for the rain that the rider set on a
 * Strava ride is kept (Strava has no weather).
 */
export function mergeStravaRides(book: BikeBook, rides: StravaRide[], today: string, limit: number): BikeBook {
  if (!book.strava) return book;
  const rained = new Set(book.rides.filter((ride) => isStravaRide(ride) && ride.rain).map((ride) => ride.id));
  const loaded: LoggedRide[] = rides.map((ride) => ({ id: ride.id, date: ride.date, terrain: ride.terrain, km: ride.km, elevationM: ride.elevationM, rain: rained.has(ride.id) }));
  const all = [...withoutStrava(book.rides), ...loaded].sort((a, b) => b.date.localeCompare(a.date));
  return { ...book, rides: all.slice(0, limit), strava: { ...book.strava, syncedAt: today } };
}
