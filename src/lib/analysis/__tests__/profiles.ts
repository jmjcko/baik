import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import { geometryOfBike } from '@/components/prepurchasing/auditGeometry';
import type { PrePurchaseAnalysisRequest, PrePurchaseGeometry, RiderProfile } from '@/types/baikfit';

const base: RiderProfile = {
  inseamMm: 840, heightCm: 178, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 420,
  riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [],
};

/** Rider matrix used by the characterization tests of the deterministic analysis. */
export const PROFILE_MATRIX: Record<string, RiderProfile> = {
  baseline: base,
  short: { ...base, heightCm: 160, inseamMm: 730, torsoLengthMm: 540, armLengthMm: 580, acromionWidthMm: 360, ridingStyle: 'endurance', flexibilityScore: 'inflexible' },
  small: { ...base, heightCm: 172, inseamMm: 790, acromionWidthMm: 380, currentPains: ['front_knee'] },
  tall: { ...base, heightCm: 192, inseamMm: 900, torsoLengthMm: 680, armLengthMm: 700, acromionWidthMm: 460, ridingStyle: 'race', flexibilityScore: 'flexible' },
  heavy: { ...base, heightCm: 176, inseamMm: 800, riderWeightKg: 110, acromionWidthMm: 400, currentPains: ['lower_back', 'saddle_sores'] },
  narrow: { ...base, acromionWidthMm: 375, currentPains: ['numb_hands'] },
  race: { ...base, ridingStyle: 'race', flexibilityScore: 'flexible', acromionWidthMm: 400 },
};

/** The geometry of the Canyon Endurace CF 8 of the catalog: what a request carries since the audit no longer takes the numbers from the model. */
export const CANYON_GEOMETRY: PrePurchaseGeometry = geometryOfBike(STOCK_BIKE_SPECS.find((bike) => bike.id === 'canyon-endurace-cf-8-di2-2024')!).geometry;

export function requestFor(name: string): PrePurchaseAnalysisRequest {
  return { bikeModelName: 'Canyon Endurace CF 8', riderProfile: PROFILE_MATRIX[name], locale: 'en', geometry: CANYON_GEOMETRY };
}
