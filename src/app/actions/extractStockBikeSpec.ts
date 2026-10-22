'use server';

import { headers } from 'next/headers';
import type { AiStockSelection } from '@/lib/bikes/types';
import { extractionLimiter } from '@/lib/bikes/extractionLimit';
import { clientKey } from '@/lib/security/rateLimit';
import { requestStockSpec, validateExtractionInput, type ExtractionInput } from '@/lib/bikes/extraction';

export type ExtractErrorCode = 'invalid_input' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

export interface ExtractStockBikeResult {
  success: boolean;
  bike?: AiStockSelection;
  error?: ExtractErrorCode;
}

/**
 * Server Action: Gemini reads the geometry and the stock components of a bike from a page (URL context tool). The
 * answer is checked against plausible ranges and is only a proposal: the rider confirms it before it is used. The
 * URL is validated (public http or https only, OWASP SSRF), not stored and not logged; the answer carries fixed codes.
 * Calls are limited per caller (a call that fails the input check or finds no key is not counted).
 */
export async function extractStockBikeSpec(input: ExtractionInput): Promise<ExtractStockBikeResult> {
  if (!validateExtractionInput(input)) return { success: false, error: 'invalid_input' };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'not_configured' };
  if (!extractionLimiter.allow(clientKey(await headers()))) return { success: false, error: 'rate_limited' };
  const outcome = await requestStockSpec(apiKey, input);
  return outcome.status === 'ok' ? { success: true, bike: outcome.bike } : { success: false, error: outcome.status };
}
