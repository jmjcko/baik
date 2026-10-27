import type { PrePurchaseAnalysisRequest } from '@/types/baikfit';
import { parseSizeSpec } from '@/lib/bikes/parseSizeSpec';

const SIZE_LABEL = /^[A-Za-z0-9./+-]{1,12}$/;
const MAX_SIZES = 20;

/** The geometry of the bike: one to twenty sizes, each with a plain label, no size twice and numbers inside the plausible ranges. */
function validGeometry(geometry: NonNullable<PrePurchaseAnalysisRequest['geometry']>): boolean {
  const { source, sizes } = geometry;
  if ((source !== 'catalog' && source !== 'rider') || !Array.isArray(sizes) || sizes.length < 1 || sizes.length > MAX_SIZES) return false;
  return new Set(sizes.map((row) => row?.size)).size === sizes.length && sizes.every((row) => typeof row?.size === 'string' && SIZE_LABEL.test(row.size) && parseSizeSpec(row.spec) !== null);
}

/** Returns an error message for an invalid request, or null when the request is valid. */
export function validateAnalysisRequest(input: PrePurchaseAnalysisRequest): string | null {
  if (!input || !input.bikeModelName || input.bikeModelName.trim().length === 0) {
    return 'Bike model name or listing query is required.';
  }
  if (!input.riderProfile || input.riderProfile.inseamMm <= 0) {
    return 'Valid rider profile measurements are required for biomechanical analysis.';
  }
  if (!input.geometry || !validGeometry(input.geometry)) {
    return 'The geometry of the bike (from the catalog or from its table) is required.';
  }
  return null;
}
