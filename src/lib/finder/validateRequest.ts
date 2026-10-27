import { RIDER_PAIN_TYPES, type RiderPainType } from '@/types/baikfit';
import { FINDER_CATEGORIES, sanitizeAnswers } from './parameters';
import type { FinderRider, RecommendRequest } from './types';

const RANGES: Record<'heightCm' | 'inseamMm' | 'torsoLengthMm' | 'armLengthMm' | 'acromionWidthMm' | 'riderWeightKg', readonly [number, number]> = {
  heightCm: [140, 215],
  inseamMm: [600, 1100],
  torsoLengthMm: [400, 900],
  armLengthMm: [450, 800],
  acromionWidthMm: [300, 500],
  riderWeightKg: [35, 200],
};

const STYLES = ['endurance', 'balanced', 'race'];
const FLEXIBILITY = ['inflexible', 'moderate', 'flexible'];

const inRange = (value: unknown, [min, max]: readonly [number, number]): boolean => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function cleanRider(raw: unknown): FinderRider | null {
  const rider = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : null;
  if (!rider || !(Object.keys(RANGES) as Array<keyof typeof RANGES>).every((key) => inRange(rider[key], RANGES[key]))) return null;
  if (!STYLES.includes(rider.ridingStyle as string) || !FLEXIBILITY.includes(rider.flexibilityScore as string)) return null;
  const pains = Array.isArray(rider.currentPains) ? rider.currentPains.filter((pain): pain is RiderPainType => (RIDER_PAIN_TYPES as readonly unknown[]).includes(pain)) : [];
  const { heightCm, inseamMm, torsoLengthMm, armLengthMm, acromionWidthMm, riderWeightKg, ridingStyle, flexibilityScore } = rider as unknown as FinderRider;
  return { heightCm, inseamMm, torsoLengthMm, armLengthMm, acromionWidthMm, riderWeightKg, ridingStyle, flexibilityScore, currentPains: pains };
}

/**
 * The request as it may be used, or null: a known kind of bike and language, plausible measurements, and only the answers
 * that belong to the kind of bike (an unknown option or a long text never gets through). An input error is a fixed code.
 */
export function validateRecommendRequest(input: unknown): RecommendRequest | null {
  const raw = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : null;
  if (!raw) return null;
  const category = FINDER_CATEGORIES.find((candidate) => candidate === raw.category);
  const rider = cleanRider(raw.rider);
  if (!category || !rider || (raw.locale !== 'en' && raw.locale !== 'cs')) return null;
  return { category, locale: raw.locale, rider, answers: sanitizeAnswers(category, raw.answers) };
}
