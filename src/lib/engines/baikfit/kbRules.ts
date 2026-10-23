/**
 * Fit rules taken from docs/knowledge/baikfit_kb_v1.3.0.md (master, single source of truth).
 * Each constant names its KB section; `KB_RULE_SOURCES` links it to a phrase of the KB text and a
 * test fails when that phrase disappears. Values the KB does not define live in ./estimates.ts.
 */
import { ESTIMATES } from './estimates';

interface Range {
  min: number;
  max: number;
}

export const KB_RULES = {
  lemondCoefficient: 0.883,
  kneeExtensionAngleDeg: { min: 30, max: 35 } as Range,
  barToAcromionRatio: 1,
  commercialBarWidthsMm: [380, 400, 420, 440] as const,
  factoryBarWidthMm: 420,
  crankRangeMm: { min: 150, max: 165 } as Range,
  recommendedCrankRangeMm: { min: 160, max: 165 } as Range,
  factoryCrankMm: 172.5,
  saddleMaxWidthMm: 145,
  saddlePitchMaxNoseDownDeg: 2,
  maxSpacerStackMm: 35,
  stemShortenMm: { min: 10, max: 20 } as Range,
  saddleRaiseStepMm: { min: 3, max: 5 } as Range,
  saddleLowerStepMm: { min: 5, max: 10 } as Range,
  savingsCzk: { min: 4000, max: 10000 } as Range,
  saddleToleranceMm: 3,
  cleatSetbackMm: { min: 10, max: 17 } as Range,
} as const;

/** Version of the knowledge base that the rules below follow; stored with every snapshot of the rider's targets (docs/knowledge/kb_backlog.md). */
export const KB_VERSION = '1.3.0';

export const KB_RULE_SOURCES: Record<keyof typeof KB_RULES, { section: string; phrase: string }> = {
  lemondCoefficient: { section: '2.1', phrase: 'Inseam (mm) * 0.883' },
  kneeExtensionAngleDeg: { section: '2.1', phrase: '30° to 35°' },
  barToAcromionRatio: { section: '2.2', phrase: '1:1 Ratio' },
  commercialBarWidthsMm: { section: '2.2', phrase: '380, 400, 420, 440 mm' },
  factoryBarWidthMm: { section: '2.2', phrase: 'The 420mm Factory Trap' },
  crankRangeMm: { section: '5', phrase: '150–165 mm' },
  recommendedCrankRangeMm: { section: '7', phrase: '160–165 mm cranks' },
  factoryCrankMm: { section: '7', phrase: 'stock crank (172.5 mm)' },
  saddleMaxWidthMm: { section: '4.2', phrase: '145 mm' },
  saddlePitchMaxNoseDownDeg: { section: '4.3', phrase: '1.5°–2.0° nose down' },
  maxSpacerStackMm: { section: '7', phrase: '>35 mm spacer stacks' },
  stemShortenMm: { section: '6', phrase: 'Shorten stem length by 10–20 mm' },
  saddleRaiseStepMm: { section: '6', phrase: 'Raise saddle Y in 3–5 mm increments' },
  saddleLowerStepMm: { section: '6', phrase: 'Lower saddle Y in 5–10 mm increments' },
  savingsCzk: { section: '7', phrase: '4,000–10,000 CZK' },
  saddleToleranceMm: { section: '1.1', phrase: 'Saddle Target Tolerance**: **±3 mm' },
  cleatSetbackMm: { section: '3.1', phrase: '10 to 17 mm behind the 1st metatarsal joint' },
};

/** KB 2.2: handlebar width equals the acromion width, rounded to the nearest commercial width (narrower on a tie). */
export function recommendedBarWidthMm(acromionWidthMm: number): number {
  const target = acromionWidthMm * KB_RULES.barToAcromionRatio;
  let best: number = KB_RULES.commercialBarWidthsMm[0];
  for (const width of KB_RULES.commercialBarWidthsMm) {
    if (Math.abs(width - target) < Math.abs(best - target)) best = width;
  }
  return best;
}

/** KB 2.2 / 7: a stock bar wider than the recommended width is the factory trap. */
export function isBarTooWide(stockBarWidthMm: number, acromionWidthMm: number): boolean {
  return stockBarWidthMm > recommendedBarWidthMm(acromionWidthMm);
}

/** Excess of a stock bar over the recommended commercial width (0 when equal or narrower). */
export function barExcessMm(stockBarWidthMm: number, acromionWidthMm: number): number {
  return Math.max(0, stockBarWidthMm - recommendedBarWidthMm(acromionWidthMm));
}

export type UlnarRisk = 'LOW' | 'MODERATE' | 'HIGH';

const COMMERCIAL_STEP_MM = KB_RULES.commercialBarWidthsMm[1] - KB_RULES.commercialBarWidthsMm[0];

/** Ulnar nerve risk: none when the bar fits, moderate up to one commercial width too wide, high beyond. */
export function ulnarRisk(stockBarWidthMm: number, acromionWidthMm: number): UlnarRisk {
  const excess = barExcessMm(stockBarWidthMm, acromionWidthMm);
  if (excess === 0) return 'LOW';
  return excess <= COMMERCIAL_STEP_MM ? 'MODERATE' : 'HIGH';
}

export interface SaddleAdjustment {
  deltaMm: number;
  direction: 'raise' | 'lower' | 'none';
}

/** Difference between the current saddle height and the LeMond target; within the tolerance (an estimate) no change. */
export function saddleAdjustment(currentMm: number, targetMm: number): SaddleAdjustment {
  const difference = currentMm - targetMm;
  if (Math.abs(difference) <= KB_RULES.saddleToleranceMm) return { deltaMm: 0, direction: 'none' };
  return { deltaMm: Math.abs(difference), direction: difference > 0 ? 'lower' : 'raise' };
}

export interface CrankRider {
  flexibilityScore?: 'inflexible' | 'moderate' | 'flexible';
  riderWeightKg: number;
  riderHeightCm?: number;
}

/** KB 5 / 7: cranks above 165 mm are oversized for riders with limited flexibility, high body mass or great height. */
export function isCrankOversized(stockCrankMm: number, rider: CrankRider): boolean {
  if (stockCrankMm <= KB_RULES.crankRangeMm.max) return false;
  return (
    rider.flexibilityScore === 'inflexible' ||
    rider.riderWeightKg > ESTIMATES.heavyRiderKg.value ||
    (rider.riderHeightCm ?? 0) > ESTIMATES.tallRiderCm.value
  );
}

export function formatCrankRange(): string {
  const { min, max } = KB_RULES.recommendedCrankRangeMm;
  return `${min}–${max}`;
}
