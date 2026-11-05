/** The service intervals by distance and the multipliers of the effective service kilometres (KB bAIkcare v1.2.0 5b). Every number is `[owner baseline]`. */

export const WEAR_COMPONENTS = ['chainLube', 'chainGauge', 'chainDeep', 'brakeCheck', 'brakeBleed', 'sealant', 'suspensionSmall', 'suspensionFull', 'mcheck', 'bearings'] as const;
export type WearComponent = (typeof WEAR_COMPONENTS)[number];

/** What a part is exposed to: it decides which multipliers apply to it. */
export type WearGroup = 'drivetrain' | 'brakes' | 'suspension' | 'sweat' | 'general';

export interface WearInterval {
  /** Effective service kilometres; the first number of the range the owner gave. */
  km: number;
  /** Metres of descent (counted as the climbing of the rides) after which the part is due as well. */
  elevationM?: number;
  /** Months after which the part is due as well. */
  months?: number;
  group: WearGroup;
  /** Only gravel and mountain bike rides count (the suspension). */
  offroadOnly?: boolean;
  /** A safety part counts in the Bike Health Score; a routine job (cleaning, lubing, measuring) is only an alert (owner, 2026-11-05). */
  scored: boolean;
}

export const WEAR_INTERVALS: Record<WearComponent, WearInterval> = {
  chainLube: { km: 100, group: 'drivetrain', scored: false },
  chainGauge: { km: 500, group: 'drivetrain', scored: false },
  chainDeep: { km: 300, group: 'drivetrain', scored: false },
  brakeCheck: { km: 500, elevationM: 2500, group: 'brakes', scored: true },
  brakeBleed: { km: 2500, months: 12, group: 'brakes', scored: true },
  sealant: { km: 1500, months: 3, group: 'general', scored: true },
  suspensionSmall: { km: 1000, group: 'suspension', offroadOnly: true, scored: true },
  suspensionFull: { km: 2500, group: 'suspension', offroadOnly: true, scored: true },
  mcheck: { km: 500, months: 1, group: 'sweat', scored: true },
  bearings: { km: 2000, group: 'sweat', scored: true },
};

export type RideTerrain = 'road' | 'trainer' | 'gravel' | 'mtb';

export const TERRAIN_FACTOR: Record<RideTerrain, number> = { road: 1, trainer: 0.6, gravel: 1.3, mtb: 1.6 };
/** Sweat reaches the cockpit and the bearings on a trainer: the corrosion risk replaces the low wear of the chain. */
export const SWEAT_TRAINER_FACTOR = 3;
export const RAIN_FACTOR = 1.5;
/** Added to the factor for every 1,000 m of climbing per 100 km. */
export const ELEVATION_STEP = 0.1;
export const OFFROAD: readonly RideTerrain[] = ['gravel', 'mtb'];

/** The Bike Health Score levels: the lowest score of each (KB 5b.3). */
export const HEALTH_LEVELS = [
  { level: 1, from: 85 },
  { level: 2, from: 50 },
  { level: 3, from: 20 },
  { level: 4, from: 0 },
] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number]['level'];
