import { textOf, yearOf } from '@/lib/bikes/extraction';
import { cleanText, type FinderAnswers } from './parameters';
import type { FinderCandidate } from './types';

/* Kept apart from the Gemini request: the browser reads the saved progress through the same checks, and the request pulls in the knowledge base (files). */

export const MAX_CANDIDATES = 3;
const MAX_REASON = 240;

/** A bike with a motor or a battery is not a sport bike of this app (ADR-039): the name or the reason says so. */
export const MOTOR = /\b(e-?bikes?|ebikes?|electric|elektro\w*|motor\w*|pedelec|bosch|fazua|shimano\s*ep\d*|mahle|turbo\s+(levo|vado|creo))\b/i;

export const compact = (text: string): string => text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/** The brands that the rider wants left out, as compact words (a brand matches when its name contains one of them). */
export function excludedBrands(answers: FinderAnswers): string[] {
  return (answers.brands_excluded?.[0] ?? '').split(/[,;]/).map(compact).filter((brand) => brand.length >= 2);
}

/** One candidate of an answer or of the saved progress, with plain text only, or null. */
export function cleanCandidate(item: unknown): FinderCandidate | null {
  if (typeof item !== 'object' || item === null) return null;
  const raw = item as Record<string, unknown>;
  const brand = textOf(raw.brand);
  const model = textOf(raw.model);
  const reason = cleanText(raw.reason, MAX_REASON);
  return brand && model && reason ? { brand, model, year: yearOf(raw.year), reason } : null;
}
