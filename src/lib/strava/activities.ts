import { isDay } from '@/lib/notifications/dates';
import type { RideTerrain } from '@/lib/engines/baikcare/wearIntervals';

/** One ride as the logbook gets it. Only these fields ever leave the server: no route, no position, no name of the activity. */
export interface StravaRide {
  /** `strava-<activity id>`: the same activity is never added twice. */
  id: string;
  date: string;
  terrain: RideTerrain;
  km: number;
  elevationM: number;
  gearId: string | null;
}

export interface StravaBike {
  id: string;
  name: string;
  km: number;
}

/** The kinds of activity that wear a bike without a motor (the e-bike kinds are out of scope of the product). */
const KINDS: Record<string, RideTerrain> = { Ride: 'road', GravelRide: 'gravel', MountainBikeRide: 'mtb', VirtualRide: 'trainer' };

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null);

/** An activity of Strava as a ride of the logbook; null for anything that is not a human powered bike ride. */
export function toRide(raw: unknown): StravaRide | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as Record<string, unknown>;
  const kind = typeof a.sport_type === 'string' ? a.sport_type : typeof a.type === 'string' ? a.type : '';
  const base = KINDS[kind];
  const meters = num(a.distance);
  const date = typeof a.start_date_local === 'string' ? a.start_date_local.slice(0, 10) : '';
  const id = typeof a.id === 'number' && Number.isSafeInteger(a.id) ? a.id : null;
  if (!base || meters === null || id === null || !isDay(date) || meters < 100) return null;
  return {
    id: `strava-${id}`,
    date,
    terrain: a.trainer === true ? 'trainer' : base,
    km: Math.round(meters / 100) / 10,
    elevationM: Math.round(num(a.total_elevation_gain) ?? 0),
    gearId: typeof a.gear_id === 'string' && a.gear_id !== '' ? a.gear_id : null,
  };
}

/** The bikes of the athlete (the gear of the kind bike), with the distance Strava counted for them. */
export function parseBikes(athlete: unknown): StravaBike[] {
  const list = typeof athlete === 'object' && athlete !== null ? (athlete as { bikes?: unknown }).bikes : null;
  if (!Array.isArray(list)) return [];
  return list.flatMap((raw): StravaBike[] => {
    const bike = raw as { id?: unknown; name?: unknown; distance?: unknown };
    const km = num(bike?.distance);
    return typeof bike?.id === 'string' && /^b\d+$/.test(bike.id) ? [{ id: bike.id, name: typeof bike.name === 'string' ? bike.name.slice(0, 80) : bike.id, km: Math.round((km ?? 0) / 1000) }] : [];
  });
}
