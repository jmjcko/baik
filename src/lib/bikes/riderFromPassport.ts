import type { RiderPassport } from '@/lib/passport/types';
import type { FlexibilityScore, RiderProfile } from '@/types/baikfit';

/**
 * The rider profile that the pre-purchase rules work with, built from the passport. The passport does not store the
 * flexibility, so the caller passes it (the pre-purchase audit asks for it); without it "moderate" is used.
 */
export function riderFromPassport(passport: RiderPassport, flexibility: FlexibilityScore = 'moderate'): RiderProfile {
  const { anatomy } = passport;
  const current = passport.bikes.find((bike) => bike.kind === 'current')?.components;
  return {
    inseamMm: anatomy.inseamMm,
    heightCm: anatomy.heightCm,
    torsoLengthMm: anatomy.torsoLengthMm,
    armLengthMm: anatomy.armLengthMm,
    acromionWidthMm: anatomy.acromionWidthMm,
    riderWeightKg: anatomy.weightKg,
    currentCrankLengthMm: current?.crankLengthMm,
    currentSaddleHeightMm: current?.saddleHeightMm,
    currentBarWidthMm: current?.handlebarWidthMm,
    flexibilityScore: flexibility,
    ridingStyle: passport.postureStyle,
    currentPains: [...passport.symptoms],
  };
}
