/**
 * MTB fitting of the bAIkfit engine (KB v1.4.0 section 11): sag, flat bar width and stem, dropper post. Pure functions,
 * no AI. The saddle height for pedalling is the LeMond height of the coordinates (the post fully extended).
 */
import { ESTIMATES } from './estimates';
import { MTB_RULES, type MtbStyle } from './mtbRules';

export { MTB_STYLES, type MtbStyle } from './mtbRules';

/** What the rider enters about a mountain bike; every number is optional (null means not entered). */
export interface MtbSetup {
  style: MtbStyle;
  /** A full suspension bike (the rear shock too); false means a hardtail. */
  fullSuspension: boolean;
  /** Fork travel. */
  travelMm: number | null;
  /** Target sag of the fork; null means the default of the style. */
  sagPercent: number | null;
  dropperTravelMm: number | null;
}

export const DEFAULT_MTB_SETUP: MtbSetup = { style: 'xc', fullSuspension: false, travelMm: null, sagPercent: null, dropperTravelMm: null };

/** Limits that keep a stored or typed number plausible (the KB ranges are wider on purpose: a rider may deviate). */
export const MTB_LIMITS = { travelMm: [60, 220], sagPercent: [10, 40], dropperTravelMm: [60, 250] } as const satisfies Record<string, readonly [number, number]>;

export const sagOf = (setup: MtbSetup): number => setup.sagPercent ?? MTB_RULES.defaultSagPercent[setup.style];

/** KB 11.1: fork sag = travel x sag percent; null when the travel is not entered. */
export function forkSagMm(setup: MtbSetup): number | null {
  return setup.travelMm === null ? null : Math.round((setup.travelMm * sagOf(setup)) / 100);
}

export interface DynamicGeometry {
  forkSagMm: number;
  /** How much steeper the head angle gets (degrees, 0 when none), an estimate. */
  headAngleSteeperDeg: number;
  /** How much longer the effective reach gets (a range, mm, null when none), an estimate. */
  reachGainMm: { min: number; max: number } | null;
}

/**
 * KB 11.1 (estimate): a hardtail steepens the head angle by 0.5 degrees per 10 mm of fork sag and gains 5 to 8 mm of effective
 * reach; a full suspension bike with balanced sag stays at its static numbers; the KB gives no change of the stack.
 */
export function dynamicGeometry(setup: MtbSetup): DynamicGeometry | null {
  const sag = forkSagMm(setup);
  if (sag === null) return null;
  if (setup.fullSuspension || sag === 0) return { forkSagMm: sag, headAngleSteeperDeg: 0, reachGainMm: null };
  const { headAngleDegPer10mm, reachGainMm } = ESTIMATES.mtbHardtailSag.value;
  return { forkSagMm: sag, headAngleSteeperDeg: Math.round((sag / 10) * headAngleDegPer10mm * 10) / 10, reachGainMm };
}

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, value));

/** KB 11.2 (owner): acromion width + 320 (XC) or + 360 (Trail), rounded to 10 mm and kept inside the range of the style. */
export function flatBarTargetMm(acromionWidthMm: number, style: MtbStyle): number {
  const rounded = Math.round((acromionWidthMm + MTB_RULES.barOffsetMm[style]) / MTB_RULES.barRoundingMm) * MTB_RULES.barRoundingMm;
  return clamp(rounded, MTB_RULES.barRangeMm[style]);
}

export interface StemAdvice {
  /** Change of the stem length: negative is shorter. */
  changeMm: number;
  /** The change is the same whatever the stem, but a stem outside 35 to 50 mm is flagged. */
  extraBarMm: number;
}

/**
 * KB 11.2: 10 mm shorter stem for every 20 mm of extra bar width, measured from the width of the rider's current bar. Nothing is
 * advised without a current bar, or when the width does not change.
 */
export function stemAdvice(targetBarMm: number, currentBarMm: number | null): StemAdvice | null {
  if (currentBarMm === null || currentBarMm === targetBarMm) return null;
  const extraBarMm = targetBarMm - currentBarMm;
  const { perBarMm, shortenMm } = MTB_RULES.stemPerBarWidth;
  return { changeMm: -Math.round((extraBarMm / perBarMm) * shortenMm), extraBarMm };
}

export interface DropperHeights {
  /** Pedalling: the post fully extended (the LeMond height). */
  extendedMm: number;
  /** Descending: the extended height minus the travel of the post, an upper limit (null when the travel is not entered). */
  loweredMm: number | null;
}

/** KB 11.3: the saddle is set for the fully extended post; the lowered height is that minus the travel. */
export function dropperHeights(extendedMm: number, setup: Pick<MtbSetup, 'dropperTravelMm'>): DropperHeights {
  return { extendedMm, loweredMm: setup.dropperTravelMm === null ? null : extendedMm - setup.dropperTravelMm };
}

/** True when the number is inside the plausible limits of the field. */
export const inLimits = (value: number, [min, max]: readonly [number, number]): boolean => Number.isFinite(value) && value >= min && value <= max;
