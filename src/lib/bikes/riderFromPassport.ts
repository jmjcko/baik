import type { RiderPassport } from '@/lib/passport/types';
import { flexibilityOf, mobilityAdjustments } from '@/lib/engines/baikfit/mobility';
import type { FlexibilityScore, RiderProfile } from '@/types/baikfit';

/**
 * The rider profile that the pre-purchase rules work with, built from the passport. The flexibility is the caller's (the
 * pre-purchase audit asks for it), else the result of the hamstring mini-test, else "moderate".
 */
export function riderFromPassport(passport: RiderPassport, flexibility?: FlexibilityScore): RiderProfile {
  const { anatomy } = passport;
  const current = passport.bikes.find((bike) => bike.id === passport.activeBikeId)?.components;
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
    flexibilityScore: flexibility ?? flexibilityOf(passport.mobility?.hamstring) ?? 'moderate',
    fitStackOffsetMm: mobilityAdjustments(passport.mobility).stackOffsetMm,
    ridingStyle: passport.postureStyle,
    currentPains: [...passport.symptoms],
  };
}
