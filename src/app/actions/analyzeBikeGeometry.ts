'use server';

import type { PrePurchaseAnalysisRequest, PrePurchaseAnalysisResponse } from '@/types/baikfit';
import { generateDeterministicAnalysis } from '@/lib/analysis/deterministicAnalysis';
import { requestGeminiAnalysis } from '@/lib/analysis/geminiClient';
import { validateAnalysisRequest } from '@/lib/analysis/requestValidation';

export interface AnalyzeBikeGeometryResult {
  success: boolean;
  data?: PrePurchaseAnalysisResponse;
  error?: string;
}

/**
 * Server Action: analyzes a prospective bike with Gemini (when an API key is configured),
 * always enforcing deterministic clinical guardrails, and falls back to the deterministic report.
 */
export async function analyzeBikeGeometry(
  input: PrePurchaseAnalysisRequest
): Promise<AnalyzeBikeGeometryResult> {
  try {
    const error = validateAnalysisRequest(input);
    if (error) return { success: false, error };

    const apiKey = process.env.GEMINI_API_KEY;
    const data = (apiKey && (await requestGeminiAnalysis(apiKey, input))) || generateDeterministicAnalysis(input);
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error during bike geometry analysis.';
    return { success: false, error: message };
  }
}
