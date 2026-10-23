import type { RiderProfile } from '@/types/baikfit';
import { ESTIMATES, type StockFrameEstimate } from '@/lib/engines/baikfit/estimates';

export type StockFrame = StockFrameEstimate;

/** Approximate factory frame and stock components for a rider height (an estimate, see estimates.ts). */
export function estimateStockFrame(heightCm: number): StockFrame {
  const table = ESTIMATES.stockFrameTable.value;
  if (heightCm < table.thresholdsCm.xs) return table.xs;
  if (heightCm < table.thresholdsCm.s) return table.s;
  if (heightCm > table.thresholdsCm.l) return table.l;
  return table.m;
}

export interface FitTargets {
  recommendedStackMm: number;
  recommendedReachMm: number;
  spacerDeltaMm: number;
  stemDeltaMm: number;
  fitMatchScore: number;
}

/** Target cockpit position and the deviation from the stock frame (estimates, see estimates.ts). */
export function computeFitTargets(rider: RiderProfile, frame: StockFrame): FitTargets {
  const stackOffset = ESTIMATES.fitStackOffsetByStyle.value[rider.ridingStyle];
  const reach = ESTIMATES.fitReachFactors.value;
  const recommendedStackMm = Math.round(rider.inseamMm * ESTIMATES.fitStackPerInseam.value + stackOffset + (rider.fitStackOffsetMm ?? 0));
  const reachOffset = rider.ridingStyle === 'race' ? reach.raceOffsetMm : 0;
  const recommendedReachMm = Math.round(rider.torsoLengthMm * reach.torso + rider.armLengthMm * reach.arm + reachOffset);
  const spacerDeltaMm = Math.max(0, Math.min(40, recommendedStackMm - frame.stackMm));
  const stemDeltaMm = recommendedReachMm - frame.reachMm;
  const stackDeviation = Math.abs(recommendedStackMm - (frame.stackMm + spacerDeltaMm));
  const score = 100 - stackDeviation * 1.2 - Math.abs(stemDeltaMm) * 1.5;
  return {
    recommendedStackMm,
    recommendedReachMm,
    spacerDeltaMm,
    stemDeltaMm,
    fitMatchScore: Math.round(Math.max(60, Math.min(98, score))),
  };
}
