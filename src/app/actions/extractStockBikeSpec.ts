'use server';

import { headers } from 'next/headers';
import { extractionLimiter } from '@/lib/bikes/extractionLimit';
import { clientKey } from '@/lib/security/rateLimit';
import {
  requestStockSpecFromImage,
  validateImageInput,
  type ExtractedBike,
  type ExtractionOutcome,
  type ImageExtractionInput,
} from '@/lib/bikes/extraction';

export type ExtractErrorCode = 'invalid_input' | 'invalid_image' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

export interface ExtractStockBikeResult {
  success: boolean;
  bike?: ExtractedBike;
  error?: ExtractErrorCode;
}

/** Runs one reading when the key is there and the caller is within the limit (a call that fails the input check, finds no key or meets an unavailable service is not counted). */
async function readWithGemini(read: (apiKey: string) => Promise<ExtractionOutcome>): Promise<ExtractStockBikeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'not_configured' };
  const caller = clientKey(await headers());
  if (!extractionLimiter.allow(caller)) return { success: false, error: 'rate_limited' };
  const outcome = await read(apiKey);
  /* A busy or unreachable service is not the caller's doing: the call does not count. */
  if (outcome.status === 'unavailable') extractionLimiter.refund(caller);
  return outcome.status === 'ok' ? { success: true, bike: outcome.bike } : { success: false, error: outcome.status };
}

/**
 * Server Action: Gemini reads the geometry of a bike from a picture of its geometry table (screenshot or photo, shrunk and
 * re-encoded in the browser). The picture is used once: it is not stored and not logged. The answer is a proposal that the rider checks.
 */
export async function extractStockBikeSpecFromImage(input: ImageExtractionInput): Promise<ExtractStockBikeResult> {
  if (!validateImageInput(input)) return { success: false, error: 'invalid_image' };
  return readWithGemini((apiKey) => requestStockSpecFromImage(apiKey, input));
}
