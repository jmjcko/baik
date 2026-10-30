import type { FitSummary } from '@/types/service';

/** A fit summary with nothing known, for tests that do not look at the garage. */
export const NO_FIT: FitSummary = { crankLengthMm: null, saddleHeightMm: null, setbackMm: null, stackMm: null, reachMm: null, barWidthMm: null };
