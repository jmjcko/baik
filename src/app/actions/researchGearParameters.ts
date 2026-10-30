'use server';

import { headers } from 'next/headers';
import { clientKey } from '@/lib/security/rateLimit';
import { researchLimiter } from '@/lib/gear/limits';
import { isMotorised, requestResearch, validateResearchRequest, type ResearchResult } from '@/lib/gear/research';

export type ResearchErrorCode = 'invalid_input' | 'out_of_scope' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

export interface ResearchResponse {
  success: boolean;
  result?: ResearchResult;
  error?: ResearchErrorCode;
}

/**
 * Server Action: Gemini suggests the parameters a buyer should weigh for the product the rider typed (the owner's key, `GEMINI_API_KEY`;
 * with no key the wizard falls back to its fixed questions). Only the product text, the language and the discipline of the bike are sent:
 * never the body or the data of the bike. The text is validated (short, plain, not a motor bike), the answer is checked against a schema
 * and cleaned, and nothing is stored or logged. A limit per caller protects the key.
 */
export async function researchGearParameters(input: unknown): Promise<ResearchResponse> {
  const request = validateResearchRequest(input);
  if (!request) return { success: false, error: 'invalid_input' };
  if (isMotorised(request.query)) return { success: false, error: 'out_of_scope' };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { success: false, error: 'not_configured' };
  const caller = clientKey(await headers());
  if (!researchLimiter.allow(caller)) return { success: false, error: 'rate_limited' };
  const outcome = await requestResearch(apiKey, request);
  /* A busy or unreachable service is not the caller's doing: the call does not count. */
  if (outcome.status === 'unavailable') researchLimiter.refund(caller);
  return outcome.status === 'ok' ? { success: true, result: outcome.result } : { success: false, error: outcome.status };
}
