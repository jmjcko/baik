import { isDay } from '@/lib/notifications/dates';
import type { RideTerrain } from '@/lib/engines/baikcare/wearIntervals';

/** One ride as the logbook gets it from Intervals.icu. Only these fields are read: no route, no position, no name of the activity. */
export interface IntervalsRide {
  /** `icu-<activity id>`: the same activity is never added twice. */
  id: string;
  date: string;
  terrain: RideTerrain;
  km: number;
  elevationM: number;
  gearId: string | null;
  gearName: string | null;
}

/** The kinds of activity that wear a bike without a motor (the e-bike kinds are out of scope of the product). */
const KINDS: Record<string, RideTerrain> = { Ride: 'road', GravelRide: 'gravel', MountainBikeRide: 'mtb', VirtualRide: 'trainer' };

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null);
const text = (value: unknown, max: number): string | null => (typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, max) : null);

function gearOf(a: Record<string, unknown>): { id: string | null; name: string | null } {
  const gear = typeof a.gear === 'object' && a.gear !== null ? (a.gear as Record<string, unknown>) : null;
  const raw = gear?.id ?? a.gear_id;
  const id = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
  return /^[A-Za-z0-9_-]{1,40}$/.test(id) ? { id, name: text(gear?.name, 80) } : { id: null, name: null };
}

/** An activity of Intervals.icu as a ride; null for anything that is not a human powered bike ride (an activity that Strava does not let Intervals.icu share has no distance and drops out here). */
export function toIntervalsRide(raw: unknown): IntervalsRide | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as Record<string, unknown>;
  const base = typeof a.type === 'string' ? KINDS[a.type] : undefined;
  const meters = num(a.distance) ?? num(a.icu_distance);
  const rawId = typeof a.id === 'string' || typeof a.id === 'number' ? String(a.id) : '';
  const date = typeof a.start_date_local === 'string' ? a.start_date_local.slice(0, 10) : '';
  if (!base || meters === null || meters < 100 || !/^[A-Za-z0-9_-]{1,40}$/.test(rawId) || !isDay(date)) return null;
  const gear = gearOf(a);
  return { id: `icu-${rawId}`, date, terrain: a.trainer === true ? 'trainer' : base, km: Math.round(meters / 100) / 10, elevationM: Math.round(num(a.total_elevation_gain) ?? 0), gearId: gear.id, gearName: gear.name };
}

/** The bikes that appear on the rides, to choose from; empty when the data has no bike on any ride. */
export function gearsOf(rides: IntervalsRide[]): Array<{ id: string; name: string }> {
  const seen = new Map<string, string>();
  for (const ride of rides) if (ride.gearId && !seen.has(ride.gearId)) seen.set(ride.gearId, ride.gearName ?? ride.gearId);
  return [...seen].map(([id, name]) => ({ id, name }));
}
