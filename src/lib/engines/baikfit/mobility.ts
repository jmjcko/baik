import type { FlexibilityScore } from '@/types/baikfit';

/** Mini-test 1 (straight leg raise on the back): the angle of the raised straight leg. */
export const HAMSTRING_LEVELS = ['low', 'medium', 'high'] as const;
export type HamstringLevel = (typeof HAMSTRING_LEVELS)[number];

/** Mini-test 2 (hands 2 cm above the bars for 3 seconds in the riding tempo). */
export const RELEASE_RESULTS = ['slumping', 'stable'] as const;
export type ReleaseResult = (typeof RELEASE_RESULTS)[number];

/** What the two mini-tests found; null means the test was not done. */
export interface Mobility {
  hamstring: HamstringLevel | null;
  release: ReleaseResult | null;
}

/**
 * Rules of the product owner (docs/knowledge/epic-26-capabilities-and-minitests.md, KB backlog section 16). The ranges are the
 * owner's; the app applies one value inside each range (the midpoint, rounded).
 */
export const MOBILITY_RULES = {
  /** Straight leg raise thresholds (degrees): below the first is low, above the second is high. */
  hamstringAnglesDeg: { low: 60, high: 75 },
  /** Low hamstring flexibility: raise the target stack (smaller drop) so that the lumbar spine does not round. */
  lowStackRangeMm: { min: 15, max: 20 },
  /** Slumping in the release test: the target saddle setback moves back so that the pelvis carries the torso. */
  slumpSetbackRangeMm: { min: 5, max: 8 },
} as const;

export const LOW_HAMSTRING_STACK_MM = 18;
export const SLUMPING_SETBACK_MM = 7;

/** Changes of the target cockpit and saddle that the mini-tests ask for (positive stack is up, positive setback is back). */
export interface MobilityAdjustments {
  stackOffsetMm: number;
  setbackOffsetMm: number;
}

export const NO_ADJUSTMENT: MobilityAdjustments = { stackOffsetMm: 0, setbackOffsetMm: 0 };

export function mobilityAdjustments(mobility: Partial<Mobility> | null | undefined): MobilityAdjustments {
  return {
    stackOffsetMm: mobility?.hamstring === 'low' ? LOW_HAMSTRING_STACK_MM : 0,
    setbackOffsetMm: mobility?.release === 'slumping' ? SLUMPING_SETBACK_MM : 0,
  };
}

/** The flexibility that the lowering guard and the pre-purchase rules read from the hamstring test; undefined when it was not done. */
export function flexibilityOf(hamstring: HamstringLevel | null | undefined): FlexibilityScore | undefined {
  if (hamstring === 'low') return 'inflexible';
  if (hamstring === 'medium') return 'moderate';
  return hamstring === 'high' ? 'flexible' : undefined;
}
