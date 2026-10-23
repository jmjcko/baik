import type { FlexibilityScore, RiderPainType, RidingStyle } from '@/types/baikfit';

/**
 * Saddle-to-handlebar position rules of the product owner (docs/knowledge/saddle-to-bar-drop-rules.md, KB backlog section 15).
 * They are hard guards: the report and the stock bike audit never advise the forbidden direction, whatever the geometry says.
 */
export const DROP_RULES = {
  /** Raise the handlebars when the drop is excessive (numb hands, lower back). */
  raiseBarsMm: { min: 10, max: 15 },
  /** Neck and trapezius pain: raise a little more. */
  raiseBarsNeckMm: { min: 10, max: 20 },
  stemShorterMm: { min: 10, max: 20 },
  /** With an excessive drop the saddle may move slightly back, never forward. */
  saddleBackMm: { min: 5, max: 10 },
} as const;

/** What the rider reported and rides like; the flexibility is known only where it was asked (the pre-purchase audit). */
export interface PositionContext {
  pains: readonly RiderPainType[];
  style?: RidingStyle;
  flexibility?: FlexibilityScore;
}

/** Symptoms that load the hands, neck or back when the handlebars go down. */
export const LOWERING_PAINS: readonly RiderPainType[] = ['numb_hands', 'neck_pain', 'lower_back'];

const has = (context: PositionContext, ...pains: RiderPainType[]): boolean => pains.some((pain) => context.pains.includes(pain));

/** Why lowering is forbidden: a symptom, only the riding style or flexibility, or not at all. */
export function loweringGuard(context: PositionContext): 'symptom' | 'style' | null {
  if (has(context, ...LOWERING_PAINS)) return 'symptom';
  return context.style === 'endurance' || context.flexibility === 'inflexible' ? 'style' : null;
}

/** Numb hands: moving the saddle forward shifts weight onto the hands. */
export const forbidsSaddleForward = (context: PositionContext): boolean => has(context, 'numb_hands');

/** Numb hands and neck pain: more reach stretches the shoulders and loads the hands. */
export const forbidsLongerStem = (context: PositionContext): boolean => has(context, 'numb_hands', 'neck_pain');

/** The riders who get the checks of the position (tilt first, bar width, reach, drop). */
export const needsPositionChecks = (context: PositionContext): boolean => has(context, ...LOWERING_PAINS);
