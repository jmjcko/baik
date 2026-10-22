import type { PrePurchaseAnalysisRequest } from '@/types/baikfit';
import { isValidExternalUrl } from '@/lib/security/urlGuard';

/** Returns an error message for an invalid request, or null when the request is valid. */
export function validateAnalysisRequest(input: PrePurchaseAnalysisRequest): string | null {
  if (!input || !input.bikeModelName || input.bikeModelName.trim().length === 0) {
    return 'Bike model name or listing query is required.';
  }
  if (input.shopUrl && !isValidExternalUrl(input.shopUrl)) {
    return 'Invalid or forbidden URL format. Only public HTTP/HTTPS URLs are supported.';
  }
  if (!input.riderProfile || input.riderProfile.inseamMm <= 0) {
    return 'Valid rider profile measurements are required for biomechanical analysis.';
  }
  return null;
}
