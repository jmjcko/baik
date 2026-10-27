import type { RiderProfile } from '@/types/baikfit';
import type { FinderRider } from './types';

/** The part of the rider profile that the finder sends (the current bike is not needed to choose a new one). */
export const finderRiderOf = (rider: RiderProfile): FinderRider => ({
  heightCm: rider.heightCm,
  inseamMm: rider.inseamMm,
  torsoLengthMm: rider.torsoLengthMm,
  armLengthMm: rider.armLengthMm,
  acromionWidthMm: rider.acromionWidthMm,
  riderWeightKg: rider.riderWeightKg,
  ridingStyle: rider.ridingStyle,
  flexibilityScore: rider.flexibilityScore,
  currentPains: rider.currentPains,
});
