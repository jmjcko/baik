import type { RidingDiscipline } from '@/types/baikfit';

export type TyreCategory = 'road' | 'gravel' | 'mtb';

/** Reference tyre of each category and its usual pressure range in bar (product owner, 2026-10-30): road 28 mm, gravel 40 mm, mountain bike 2.4 inch. */
export const PRESSURE_RANGES: Record<TyreCategory, { minBar: number; maxBar: number }> = {
  road: { minBar: 5.0, maxBar: 6.5 },
  gravel: { minBar: 2.2, maxBar: 3.2 },
  mtb: { minBar: 1.4, maxBar: 1.8 },
};

/** The rider weights that mark the bottom and the top of the range: at or below the light weight the low end, at or above the heavy weight the high end (kb_backlog.md section 25). */
export const WEIGHT_SPAN = { lightKg: 60, heavyKg: 100 } as const;

export interface PressureGuide {
  category: TyreCategory;
  minBar: number;
  maxBar: number;
  /** The pressure for the rider's weight, rounded to 0.1 bar; the middle of the range when the weight is unknown. */
  bar: number;
}

export const tyreCategory = (discipline: RidingDiscipline): TyreCategory => (discipline === 'xc_mtb' ? 'mtb' : discipline === 'gravel' ? 'gravel' : 'road');

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The usual range of the category and a point in it that follows the rider's weight in a straight line. */
export function pressureGuide(category: TyreCategory, riderWeightKg: number | null): PressureGuide {
  const { minBar, maxBar } = PRESSURE_RANGES[category];
  const known = riderWeightKg !== null && Number.isFinite(riderWeightKg);
  const share = known ? (riderWeightKg - WEIGHT_SPAN.lightKg) / (WEIGHT_SPAN.heavyKg - WEIGHT_SPAN.lightKg) : 0.5;
  const t = Math.min(1, Math.max(0, share));
  return { category, minBar, maxBar, bar: round1(minBar + t * (maxBar - minBar)) };
}
