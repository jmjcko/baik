/**
 * The measured setup of a modified bike (Epic 34): the numbers the rider took from the real bike, and the deltas against the targets
 * of the knowledge base. Pure functions. A target the KB does not define gives no delta (docs/knowledge/kb_backlog.md, section 20).
 */
import { DROP_RULES, forbidsLongerStem, forbidsSaddleForward, loweringGuard, type PositionContext } from './dropRules';
import { MTB_RULES } from './mtbRules';

export type SetupMode = 'stock' | 'custom';

/** The measurements that the profile did not hold before; the saddle height, bar width and cranks have their own values. */
export interface CustomSetup {
  saddleSetbackMm: number | null;
  stemLengthMm: number | null;
  spacerStackMm: number | null;
  saddleToBarDropMm: number | null;
}

export const DEFAULT_CUSTOM_SETUP: CustomSetup = { saddleSetbackMm: null, stemLengthMm: null, spacerStackMm: null, saddleToBarDropMm: null };

/** Limits that keep a typed or stored number plausible. */
export const CUSTOM_LIMITS = {
  saddleSetbackMm: [0, 300],
  stemLengthMm: [20, 180],
  spacerStackMm: [0, 60],
  saddleToBarDropMm: [-80, 160],
} as const satisfies Record<keyof CustomSetup, readonly [number, number]>;

export const CUSTOM_SETUP_KEYS = Object.keys(DEFAULT_CUSTOM_SETUP) as Array<keyof CustomSetup>;

export const isSetupMode = (value: unknown): value is SetupMode => value === 'stock' || value === 'custom';

/** The setback is a measured distance behind the bottom bracket; a delta below this is inside the accuracy of a plumb line (the smallest step of KB backlog section 15). */
export const SETBACK_TOLERANCE_MM = DROP_RULES.saddleBackMm.min;

export interface Delta {
  /** Always positive: how far to move. */
  mm: number;
  direction: 'back' | 'forward' | 'shorter';
}

/** Setback against the target (an estimate, KB 1.1 gives no formula); a move forward is never advised for numb hands. */
export function setbackDelta(measuredMm: number | null, targetMm: number, context: PositionContext): Delta | null {
  if (measuredMm === null) return null;
  const difference = Math.round(targetMm - measuredMm);
  if (Math.abs(difference) < SETBACK_TOLERANCE_MM) return null;
  if (difference > 0) return { mm: difference, direction: 'back' };
  return forbidsSaddleForward(context) ? null : { mm: -difference, direction: 'forward' };
}

/**
 * Stem against the KB. A mountain bike has the range of KB 11.2 (a longer stem is shortened to its maximum). A road bike has no target
 * length in the KB: only a rider with numb hands or neck pain is told to shorten it (the 10 to 20 mm of the drop rules), and nobody is told to lengthen it.
 */
export function stemDelta(measuredMm: number | null, mtb: boolean, context: PositionContext): Delta | null {
  if (measuredMm === null) return null;
  if (mtb) return measuredMm > MTB_RULES.stemRangeMm.max ? { mm: measuredMm - MTB_RULES.stemRangeMm.max, direction: 'shorter' } : null;
  return forbidsLongerStem(context) && measuredMm - DROP_RULES.stemShorterMm.max >= CUSTOM_LIMITS.stemLengthMm[0] ? { mm: DROP_RULES.stemShorterMm.max, direction: 'shorter' } : null;
}

/** The drop after raising the bars by the rule; only where the rider must not go lower (otherwise the drop is the rider's choice). */
export function raisedDrop(drop: number | null, context: PositionContext): { fromMm: number; toMin: number; toMax: number } | null {
  if (drop === null || loweringGuard(context) !== 'symptom') return null;
  const { min, max } = context.pains.includes('neck_pain') ? DROP_RULES.raiseBarsNeckMm : DROP_RULES.raiseBarsMm;
  return { fromMm: drop, toMin: drop - max, toMax: drop - min };
}
