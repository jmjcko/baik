import type { FlexibilityScore, RiderPainType, RidingStyle } from '@/types/baikfit';
import type { FinderAnswers, FinderCategory } from './parameters';

/** A bike that the AI suggested. Nothing here is checked until a geometry table of the bike exists. */
export interface FinderCandidate {
  brand: string;
  model: string;
  year: number | null;
  reason: string;
}

/** The rider as the finder needs it (the profile of path B, without the current bike). */
export interface FinderRider {
  heightCm: number;
  inseamMm: number;
  torsoLengthMm: number;
  armLengthMm: number;
  acromionWidthMm: number;
  riderWeightKg: number;
  ridingStyle: RidingStyle;
  flexibilityScore: FlexibilityScore;
  currentPains: RiderPainType[];
}

export interface RecommendRequest {
  category: FinderCategory;
  locale: 'en' | 'cs';
  answers: FinderAnswers;
  rider: FinderRider;
}

export type RecommendErrorCode = 'invalid_input' | 'not_configured' | 'rate_limited' | 'unavailable' | 'unreadable';

export interface RecommendResult {
  success: boolean;
  candidates?: FinderCandidate[];
  error?: RecommendErrorCode;
}
