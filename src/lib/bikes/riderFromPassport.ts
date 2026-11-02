import type { RiderPassport } from '@/lib/passport/types';
import { activeBikeOf } from '@/lib/passport/garage';
import { activeRiderOf } from '@/lib/passport/riders';
import { flexibilityOf, mobilityAdjustments } from '@/lib/engines/baikfit/mobility';
import type { FlexibilityScore, RiderProfile } from '@/types/baikfit';

/**
 * The rider profile that the pre-purchase rules work with, built from the passport. The flexibility is the caller's (the
 * pre-purchase audit asks for it), else the result of the hamstring mini-test, else "moderate".
 */
export function riderFromPassport(passport: RiderPassport, flexibility?: FlexibilityScore): RiderProfile {
  const { anatomy, mobility, symptoms } = activeRiderOf(passport);
  const bike = activeBikeOf(passport);
  const current = bike?.components;
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
    flexibilityScore: flexibility ?? flexibilityOf(mobility?.hamstring) ?? 'moderate',
    fitStackOffsetMm: mobilityAdjustments(mobility).stackOffsetMm,
    ridingStyle: bike?.ridingStyle ?? 'balanced',
    currentPains: [...symptoms],
  };
}
