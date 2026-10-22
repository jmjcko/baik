import type { RiderPassport } from '@/lib/passport/types';
import type { FlexibilityScore, RiderProfile } from '@/types/baikfit';
import { computeFitTargets } from '@/lib/analysis/stockFrame';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { effectiveReachMm, frameOf } from './frameOf';
import { riderFromPassport } from './riderFromPassport';
import { rankSizes } from './sizeRanking';
import { buildStockTraps } from './stockTraps';
import type { Adjustment, SizeSpec, StockBikeSpec, StockComponent, StockFitAuditResult } from './types';

export interface EvaluateOptions {
  /** The passport does not store the flexibility; the pre-purchase audit asks for it. Default "moderate". */
  flexibility?: FlexibilityScore;
}

/** The published value, or the estimate of the app when the maker does not publish it (and the result says so). */
function stockOrAssumed(published: number | null, assumed: number): { value: number; basis: Adjustment['basis'] } {
  return published === null ? { value: assumed, basis: 'assumed' } : { value: published, basis: 'stock' };
}

/**
 * How far the saddle has to move on its rails from the middle: the target setback minus the setback that the seat tube
 * angle and the seat post offset give at the saddle height of the rider. Positive: backwards.
 */
function saddleSetback(passport: RiderPassport, spec: SizeSpec): { adjustment: Adjustment; outOfRange: boolean } {
  const { saddle } = computeBikeFitCoordinates({ inseamMm: passport.anatomy.inseamMm, ridingDiscipline: passport.discipline });
  const offset = stockOrAssumed(spec.stockSeatpostOffsetMm, ESTIMATES.assumedStockSeatpostOffsetMm.value);
  const onTube = saddle.heightAlongTubeMm * Math.cos((spec.seatTubeAngleDeg * Math.PI) / 180);
  const deltaMm = Math.round(Math.abs(saddle.setbackXMm) - (onTube + offset.value));
  return { adjustment: { deltaMm, basis: offset.basis }, outOfRange: Math.abs(deltaMm) > ESTIMATES.saddleRailRangeMm.value };
}

/** Spacers under the stem: what the target stack needs above the frame stack, against the factory spacers. Positive: add. */
function spacers(recommendedStackMm: number, spec: SizeSpec): { adjustment: Adjustment; overLimit: boolean } {
  const needed = Math.max(0, recommendedStackMm - spec.frameStackMm);
  const stock = stockOrAssumed(spec.stockSpacersMm, ESTIMATES.assumedStockSpacersMm.value);
  return { adjustment: { deltaMm: Math.round(needed - stock.value), basis: stock.basis }, overLimit: needed > KB_RULES.maxSpacerStackMm };
}

const PUBLISHED: Array<[StockComponent, keyof SizeSpec]> = [
  ['stem', 'stockStemMm'], ['handlebar', 'stockHandlebarMm'], ['crank', 'stockCrankMm'],
  ['seatpostOffset', 'stockSeatpostOffsetMm'], ['spacers', 'stockSpacersMm'],
];

const unpublished = (spec: SizeSpec): StockComponent[] => PUBLISHED.filter(([, key]) => spec[key] === null).map(([component]) => component);

function diyChanges(passport: RiderPassport, rider: RiderProfile, spec: SizeSpec, size: string) {
  const fit = computeFitTargets(rider, frameOf(size, spec));
  const setback = saddleSetback(passport, spec);
  const stack = spacers(fit.recommendedStackMm, spec);
  return {
    fitMatchScore: fit.fitMatchScore,
    diy: {
      saddleSetbackDeltaMm: setback.adjustment,
      spacerDeltaMm: stack.adjustment,
      reachDeltaMm: Math.round(fit.recommendedReachMm - effectiveReachMm(spec)),
      saddleOutOfRailRange: setback.outOfRange,
      spacersOverLimit: stack.overLimit,
    },
  };
}

/**
 * Audit of a series bike in one size for a rider (Epic 20): the changes that need no purchase (saddle on its rails,
 * spacers, reach), the best frame size of the model, and warnings about the factory handlebar and cranks. Pure and
 * deterministic; the numbers of the target cockpit are the estimates of the app (see estimates.ts).
 * @throws RangeError when the bike has no such size.
 */
export function evaluateStockBikeFit(passport: RiderPassport, bike: StockBikeSpec, selectedSize: string, options: EvaluateOptions = {}): StockFitAuditResult {
  const spec = bike.sizes[selectedSize];
  if (!spec) throw new RangeError(`${bike.id} has no size ${selectedSize}`);
  const rider = riderFromPassport(passport, options.flexibility);
  const ranking = rankSizes(rider, bike);
  const { fitMatchScore, diy } = diyChanges(passport, rider, spec, selectedSize);
  const { alerts, traps } = buildStockTraps(rider, frameOf(selectedSize, spec), spec.stockHandlebarMm, spec.stockCrankMm);
  return {
    bikeId: bike.id,
    size: selectedSize,
    fitMatchScore,
    diy,
    recommendedSize: { size: ranking[0].size, selectedIsBest: ranking[0].size === selectedSize, ranking },
    alerts,
    traps,
    unknownComponents: unpublished(spec),
  };
}
