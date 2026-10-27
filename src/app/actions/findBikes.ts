'use server';

import { headers } from 'next/headers';
import { clientKey } from '@/lib/security/rateLimit';
import { recommendLimiter } from '@/lib/finder/limits';
import { requestRecommendation } from '@/lib/finder/recommendation';
import { riderTableLimiter, toTableFiles, validateRiderTables } from '@/lib/bikes/riderTables';
import { requestBikeTable, type BikeTable } from '@/lib/bikes/tableExtraction';
import type { RecommendResult } from '@/lib/finder/types';
import { validateRecommendRequest } from '@/lib/finder/validateRequest';

export type TableErrorCode = 'invalid_input' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

export interface TableResult {
  success: boolean;
  table?: BikeTable;
  error?: TableErrorCode;
}

/**
 * Server Action: Gemini suggests up to three bikes for the answers of the rider (the owner's key, `GEMINI_API_KEY`; with no key there
 * is no suggestion). The answer is checked against a schema and is only a proposal: the size and the verdict come from the geometry.
 * The request is validated (a known kind of bike, plausible measurements, only the known options); the answers are not stored or logged.
 */
export async function recommendBikes(input: unknown): Promise<RecommendResult> {
  const request = validateRecommendRequest(input);
  if (!request) return { success: false, error: 'invalid_input' };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'not_configured' };
  const caller = clientKey(await headers());
  if (!recommendLimiter.allow(caller)) return { success: false, error: 'rate_limited' };
  const outcome = await requestRecommendation(apiKey, request);
  /* A busy or unreachable service is not the caller's doing: the call does not count. */
  if (outcome.status === 'unavailable') recommendLimiter.refund(caller);
  return outcome.status === 'ok' ? { success: true, candidates: outcome.candidates } : { success: false, error: outcome.status };
}

/**
 * Server Action: Gemini reads every frame size from the pictures of the tables of one bike (shrunk and re-encoded in the browser), the
 * same reading that the owner's catalog page uses. The pictures are used once: not stored, not logged. The answer is a proposal that the
 * rider checks and corrects; a limit of its own protects the key.
 */
export async function readGeometryTable(input: unknown): Promise<TableResult> {
  if (!validateRiderTables(input)) return { success: false, error: 'invalid_input' };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'not_configured' };
  const caller = clientKey(await headers());
  if (!riderTableLimiter.allow(caller)) return { success: false, error: 'rate_limited' };
  const outcome = await requestBikeTable(apiKey, { files: toTableFiles(input.images), name: input.name });
  if (outcome.status === 'unavailable') riderTableLimiter.refund(caller);
  return outcome.status === 'ok' ? { success: true, table: outcome.table } : { success: false, error: outcome.status };
}
