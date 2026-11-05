import type { DrivetrainSpeeds } from '@/types/maintain';
import { CHAIN_THRESHOLDS } from './chainWear';
import {
  ELEVATION_STEP, HEALTH_LEVELS, OFFROAD, RAIN_FACTOR, SWEAT_TRAINER_FACTOR, TERRAIN_FACTOR, WEAR_COMPONENTS, WEAR_INTERVALS,
  type HealthLevel, type RideTerrain, type WearComponent,
} from './wearIntervals';

/** One ride as the logbook knows it (typed by the rider, later read from Strava); `date` is `YYYY-MM-DD`. */
export interface Ride {
  date: string;
  terrain: RideTerrain;
  km: number;
  /** Metres of climbing. */
  elevationM: number;
  /** The rider ticked a ride in the rain or on a wet road. */
  rain: boolean;
}

export interface WearInput {
  rides: Ride[];
  /** The day each part was last serviced; only the rides after that day count. A part without a day counts every ride. */
  lastService: Partial<Record<WearComponent, string>>;
  /** Today, `YYYY-MM-DD`. */
  now: string;
  /** The gauge reading in percent and the drivetrain it was taken on; null when not measured. */
  chainWearPct?: number | null;
  speeds?: DrivetrainSpeeds;
}

export type WearId = WearComponent | 'chainStretch';

export interface ComponentWear {
  id: WearId;
  /** Effective service kilometres since the last service. */
  usedKm: number;
  /** Used share of the interval: 1 means the interval is reached; can be above 1. */
  wear: number;
}

export type WearAlert = { kind: 'due'; component: WearId; wear: number } | { kind: 'wetRide'; km: number };

export interface WearReport {
  components: ComponentWear[];
  /** 0 to 100, from the most worn safety part. */
  health: number;
  level: HealthLevel;
  /** The parts that reached their interval (the most worn first) and the rain advice. */
  alerts: WearAlert[];
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAYS_PER_MONTH = 30.4375;
const validRide = (ride: Ride): boolean => DATE.test(ride.date) && Number.isFinite(ride.km) && ride.km > 0 && Number.isFinite(ride.elevationM) && ride.elevationM >= 0;
const dayNumber = (date: string): number => Date.parse(`${date}T00:00:00Z`) / 86_400_000;

/** The factor of a ride for one part: the terrain, and for the drivetrain and the brakes the climbing and the rain. */
export function rideFactor(ride: Ride, component: WearComponent): number {
  const { group } = WEAR_INTERVALS[component];
  const terrain = group === 'sweat' && ride.terrain === 'trainer' ? SWEAT_TRAINER_FACTOR : TERRAIN_FACTOR[ride.terrain];
  if (group !== 'drivetrain' && group !== 'brakes') return terrain;
  const climbPer100Km = (ride.elevationM / ride.km) * 100;
  return terrain * (1 + ELEVATION_STEP * (climbPer100Km / 1000)) * (ride.rain ? RAIN_FACTOR : 1);
}

/** The rides that count for a part: valid, after its last service, and off-road only where the part asks for it. */
function ridesFor(component: WearComponent, input: WearInput): Ride[] {
  const since = input.lastService[component];
  const { offroadOnly } = WEAR_INTERVALS[component];
  return input.rides.filter((ride) => validRide(ride) && (!since || ride.date > since) && (!offroadOnly || OFFROAD.includes(ride.terrain)));
}

/** The used share of the interval: the largest of the distance, the climbing and the time. */
export function componentWear(component: WearComponent, input: WearInput): ComponentWear {
  const interval = WEAR_INTERVALS[component];
  const rides = ridesFor(component, input);
  const usedKm = rides.reduce((sum, ride) => sum + ride.km * rideFactor(ride, component), 0);
  const climb = rides.reduce((sum, ride) => sum + ride.elevationM, 0);
  const since = input.lastService[component];
  const months = since && DATE.test(since) && DATE.test(input.now) ? (dayNumber(input.now) - dayNumber(since)) / DAYS_PER_MONTH : 0;
  const shares = [usedKm / interval.km, interval.elevationM ? climb / interval.elevationM : 0, interval.months ? Math.max(0, months) / interval.months : 0];
  return { id: component, usedKm, wear: Math.max(...shares) };
}

/** The gauge reading against the limit at which the chain must be replaced (KB 3.1); null when nothing was measured. */
export function chainStretchWear(chainWearPct: number | null | undefined, speeds: DrivetrainSpeeds = '11-12'): ComponentWear | null {
  if (chainWearPct === null || chainWearPct === undefined || !Number.isFinite(chainWearPct) || chainWearPct < 0) return null;
  return { id: 'chainStretch', usedKm: 0, wear: chainWearPct / CHAIN_THRESHOLDS[speeds].chainPct };
}

/** The stretched chain counts, and the safety parts of the table; the routine jobs are alerts only. */
const scored = (c: ComponentWear): boolean => c.id === 'chainStretch' || WEAR_INTERVALS[c.id].scored;

export const healthScore = (components: ComponentWear[]): number => Math.max(0, Math.min(100, Math.round(100 - Math.max(0, ...components.filter(scored).map((c) => c.wear)) * 100)));
export const healthLevel = (score: number): HealthLevel => (HEALTH_LEVELS.find((entry) => score >= entry.from) ?? HEALTH_LEVELS[3]).level;

/** Real kilometres of the rides in the rain since the chain was last cleaned (the advice of KB 5b.2); 0 when none. */
export function wetKmSinceChainJob(input: WearInput): number {
  return ridesFor('chainLube', input).filter((ride) => ride.rain).reduce((sum, ride) => sum + ride.km, 0);
}

export function wearReport(input: WearInput): WearReport {
  const stretch = chainStretchWear(input.chainWearPct, input.speeds);
  const components = [...WEAR_COMPONENTS.map((id) => componentWear(id, input)), ...(stretch ? [stretch] : [])];
  const health = healthScore(components);
  const due = components.filter((c) => c.wear >= 1).sort((a, b) => b.wear - a.wear).map((c): WearAlert => ({ kind: 'due', component: c.id, wear: c.wear }));
  const wet = wetKmSinceChainJob(input);
  return { components, health, level: healthLevel(health), alerts: [...(wet > 0 ? [{ kind: 'wetRide' as const, km: wet }] : []), ...due] };
}
