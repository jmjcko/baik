import { findStockBike } from '@/lib/bikes/lookup';
import { frameOf } from '@/lib/bikes/frameOf';
import { rankSizes } from '@/lib/bikes/sizeRanking';
import { buildStockTraps } from '@/lib/bikes/stockTraps';
import type { StockBikeSpec } from '@/lib/bikes/types';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import type { FactoryComponentTrap, RiderProfile } from '@/types/baikfit';
import type { FinderCandidate } from './types';

export const VERDICT_GOOD_SCORE = 90;
export const VERDICT_CHANGES_SCORE = 78;

export type FitVerdict = 'good' | 'changes' | 'low';

export interface BikeAssessment {
  bestSize: string;
  sizes: readonly string[];
  fitMatchScore: number;
  /** The target minus the bike, in the best size (positive: the bike is too low or too short for the rider). */
  stackDeviationMm: number;
  reachDeviationMm: number;
  verdict: FitVerdict;
  traps: { en: FactoryComponentTrap[]; cs: FactoryComponentTrap[] };
}

const compact = (text: string): string => text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/** Estimates of the app (KB backlog, Epic 32): how far the best size may be from the target before the bike needs changes, and before it is no match. */
export const CHANGES_STACK_MM = 15;
export const CHANGES_REACH_MM = 20;
export const NO_MATCH_REACH_MM = 30;

const rank: Record<FitVerdict, number> = { good: 0, changes: 1, low: 2 };
const worse = (a: FitVerdict, b: FitVerdict): FitVerdict => (rank[a] >= rank[b] ? a : b);

/**
 * The verdict of a bike in its best size. The score alone hides what the changes cost (it counts spacers as free), so the
 * deviations count too: a stack that needs more spacers than KB 7 allows, or a reach far from the target, is no match.
 */
export function verdictOf(score: number, stackDeviationMm = 0, reachDeviationMm = 0): FitVerdict {
  const byScore: FitVerdict = score >= VERDICT_GOOD_SCORE ? 'good' : score >= VERDICT_CHANGES_SCORE ? 'changes' : 'low';
  const stack: FitVerdict = Math.abs(stackDeviationMm) > KB_RULES.maxSpacerStackMm ? 'low' : Math.abs(stackDeviationMm) > CHANGES_STACK_MM ? 'changes' : 'good';
  const reach: FitVerdict = Math.abs(reachDeviationMm) > NO_MATCH_REACH_MM ? 'low' : Math.abs(reachDeviationMm) > CHANGES_REACH_MM ? 'changes' : 'good';
  return worse(worse(byScore, stack), reach);
}

export interface ResolvedBike {
  bike: StockBikeSpec;
  /** The AI named a model year that the bike of the catalog does not have. */
  yearDiffers: boolean;
}

/** The bike of the catalog (seed or community) that the candidate names, or null. The build must be the same: another build has other parts. */
export function resolveCandidate(candidate: FinderCandidate, bikes: readonly StockBikeSpec[]): ResolvedBike | null {
  const named = `${candidate.brand} ${candidate.model}${candidate.year ? ` ${candidate.year}` : ''}`;
  const bike = findStockBike(named)?.bike ?? bikes.find((known) => compact(known.brand) === compact(candidate.brand) && compact(known.model) === compact(candidate.model));
  if (!bike) return null;
  return { bike, yearDiffers: candidate.year !== null && !bike.years.includes(candidate.year) };
}

/**
 * The best size of a bike for the rider and what the factory parts of that size do to the rider (KB 2.2 and 5). The size and the
 * verdict come from the geometry only; a mountain bike has a flat bar, which the drop bar rule does not judge.
 */
export function assessBike(rider: RiderProfile, bike: StockBikeSpec): BikeAssessment {
  const [best] = rankSizes(rider, bike);
  const spec = bike.sizes[best.size];
  /* The trap texts of the handlebar are those of a drop bar; a flat bar is judged by KB 11.2 elsewhere. The kind is dropped so that a bar that is not asked about never raises a flat bar alert. */
  const flatBar = rider.bikeKind === 'xc_mtb';
  const judged = flatBar ? { ...rider, bikeKind: undefined } : rider;
  const { traps } = buildStockTraps(judged, frameOf(best.size, spec), flatBar ? null : spec.stockHandlebarMm, spec.stockCrankMm);
  return {
    bestSize: best.size,
    sizes: bike.sizeOrder,
    fitMatchScore: best.fitMatchScore,
    stackDeviationMm: best.stackDeviationMm,
    reachDeviationMm: best.reachDeviationMm,
    verdict: verdictOf(best.fitMatchScore, best.stackDeviationMm, best.reachDeviationMm),
    traps,
  };
}
