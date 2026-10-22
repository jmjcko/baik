import type { RiderProfile } from '@/types/baikfit';
import { computeFitTargets } from '@/lib/analysis/stockFrame';
import { frameOf } from './frameOf';
import type { SizeRanking, StockBikeSpec } from './types';

/**
 * Every size of the bike ordered from the best match to the worst: by the fit score, then by the remaining deviation
 * of stack and reach, then by the smaller size. The deviations are the target minus the bike (positive: the bike is
 * too low or too short for the rider).
 */
export function rankSizes(rider: RiderProfile, bike: StockBikeSpec): SizeRanking[] {
  const rows = bike.sizeOrder.map((size, order) => {
    const frame = frameOf(size, bike.sizes[size]);
    const fit = computeFitTargets(rider, frame);
    const stackDeviationMm = fit.recommendedStackMm - frame.stackMm;
    const reachDeviationMm = fit.recommendedReachMm - frame.reachMm;
    return { order, size, stackDeviationMm, reachDeviationMm, fitMatchScore: fit.fitMatchScore };
  });
  const remaining = (row: (typeof rows)[number]) => Math.abs(row.stackDeviationMm) + Math.abs(row.reachDeviationMm);
  rows.sort((a, b) => b.fitMatchScore - a.fitMatchScore || remaining(a) - remaining(b) || a.order - b.order);
  return rows.map(({ size, stackDeviationMm, reachDeviationMm, fitMatchScore }) => ({ size, stackDeviationMm, reachDeviationMm, fitMatchScore }));
}
