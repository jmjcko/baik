import type { StockFrame } from '@/lib/analysis/stockFrame';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import type { SizeSpec } from './types';

/**
 * Reach of the stock bike in the datum of the target reach: the frame reach plus what the stock stem adds to the
 * reference stem (an estimate, see `ESTIMATES.referenceStemMm`). A stem the maker does not publish adds nothing.
 */
export function effectiveReachMm(spec: SizeSpec): number {
  const reference = ESTIMATES.referenceStemMm.value;
  return spec.frameReachMm + (spec.stockStemMm ?? reference) - reference;
}

/** A size as the frame the pre-purchase rules work with; an unpublished handlebar or crank is 0 (it never triggers a rule). */
export function frameOf(size: string, spec: SizeSpec): StockFrame {
  return {
    size,
    stackMm: spec.frameStackMm,
    reachMm: effectiveReachMm(spec),
    barWidthMm: spec.stockHandlebarMm ?? 0,
    crankMm: spec.stockCrankMm ?? 0,
  };
}
