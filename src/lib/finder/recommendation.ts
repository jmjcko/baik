import { modelKey } from '@/lib/catalog/key';
import { fetchAnswer, jsonOf, wait, type GeminiRequest } from '@/lib/bikes/extraction';
import type { FinderAnswers } from './parameters';
import { MAX_CANDIDATES, MOTOR, cleanCandidate, compact, excludedBrands } from './candidates';
import { buildSystemPrompt, buildUserPrompt } from './prompt';
import type { FinderCandidate, RecommendRequest } from './types';

/**
 * The candidates of the answer, or null when there is none that can be used: not more than three, no motor bike, no
 * excluded brand, no model twice. The text is plain data (control characters and markup characters out).
 */
export function parseRecommendation(text: string, answers: FinderAnswers): FinderCandidate[] | null {
  const reply = jsonOf(text) as { bikes?: unknown } | null;
  if (!reply || !Array.isArray(reply.bikes)) return null;
  const excluded = excludedBrands(answers);
  const seen = new Set<string>();
  const kept: FinderCandidate[] = [];
  for (const item of reply.bikes) {
    const candidate = cleanCandidate(item);
    if (!candidate || MOTOR.test(`${candidate.brand} ${candidate.model} ${candidate.reason}`)) continue;
    const key = modelKey(candidate.brand, candidate.model, candidate.year ?? 0);
    if (seen.has(key) || excluded.some((brand) => compact(candidate.brand).includes(brand))) continue;
    seen.add(key);
    kept.push(candidate);
  }
  return kept.length > 0 ? kept.slice(0, MAX_CANDIDATES) : null;
}

export type RecommendOutcome = { status: 'ok'; candidates: FinderCandidate[] } | { status: 'unreadable' } | { status: 'unavailable' };

/** Asks Gemini for the candidates (no tools: the answer is the model's own knowledge, which the app then does not trust). */
export async function requestRecommendation(apiKey: string, request: RecommendRequest, fetchImpl: typeof fetch = fetch, pause: (ms: number) => Promise<void> = wait): Promise<RecommendOutcome> {
  const gemini: GeminiRequest = { system: buildSystemPrompt(request.locale), parts: [{ text: buildUserPrompt(request) }] };
  const text = await fetchAnswer(apiKey, gemini, fetchImpl, pause);
  if (text === null) return { status: 'unavailable' };
  const candidates = parseRecommendation(text, request.answers);
  return candidates ? { status: 'ok', candidates } : { status: 'unreadable' };
}

