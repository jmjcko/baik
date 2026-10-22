import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, KB_VERSION, recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/profile/values';
import { parsePassport } from './parse';
import type { PassportBike, PassportTargets, RiderPassport, RiderProfileRow } from './types';

export const CURRENT_BIKE_ID = 'current';

/** Snapshot of the calculated targets (from the KB rules) for the modules that only read the passport. */
export function buildTargetsSnapshot(values: Pick<ProfileValues, 'acromionWidthMm'>, coordinates: BikeFitCoordinates): PassportTargets {
  return {
    saddleHeightMm: coordinates.saddle.heightAlongTubeMm,
    saddleSetbackMm: coordinates.saddle.setbackXMm,
    saddlePitchDeg: KB_RULES.saddlePitchMaxNoseDownDeg,
    cockpitStackMm: coordinates.cockpit.stackYMm,
    cockpitReachMm: coordinates.cockpit.reachXMm,
    handlebarWidthMm: recommendedBarWidthMm(values.acromionWidthMm),
    crankLengthMm: KB_RULES.crankRangeMm.max,
    cleatSetbackMm: { min: KB_RULES.cleatSetbackMm.min, max: KB_RULES.cleatSetbackMm.max },
    kbVersion: KB_VERSION,
  };
}

function currentBike(values: ProfileValues): PassportBike {
  return {
    id: CURRENT_BIKE_ID,
    kind: 'current',
    components: {
      saddleHeightMm: values.currentSaddleHeightMm,
      handlebarWidthMm: values.currentBarWidthMm,
      crankLengthMm: values.crankLengthMm,
    },
    ...(values.stockBike ? { stock: values.stockBike } : {}),
  };
}

/**
 * Builds the passport of the wizard values. Whatever the wizard does not collect (optional measurements, gear,
 * candidate bikes) is kept from the passport that was there before.
 */
export function profileToPassport(values: ProfileValues, coordinates: BikeFitCoordinates, previous?: RiderPassport | null): RiderPassport {
  return {
    discipline: values.discipline,
    postureStyle: values.ridingStyle,
    anatomy: {
      ...previous?.anatomy,
      inseamMm: values.inseamMm,
      acromionWidthMm: values.acromionWidthMm,
      torsoLengthMm: values.torsoLengthMm,
      armLengthMm: values.armLengthMm,
      heightCm: values.heightCm,
      weightKg: values.riderWeightKg,
    },
    symptoms: [...values.currentPains],
    targets: buildTargetsSnapshot(values, coordinates),
    bikes: [currentBike(values), ...(previous?.bikes.filter((bike) => bike.kind !== 'current') ?? [])],
    gear: previous?.gear ?? {},
  };
}

/** The wizard values of a passport (what the report and the studio work with). */
export function passportToProfile(passport: RiderPassport): ProfileValues {
  const currentBike = passport.bikes.find((bike) => bike.kind === 'current');
  const current = currentBike?.components;
  const { anatomy } = passport;
  return {
    inseamMm: anatomy.inseamMm,
    acromionWidthMm: anatomy.acromionWidthMm,
    torsoLengthMm: anatomy.torsoLengthMm,
    armLengthMm: anatomy.armLengthMm,
    heightCm: anatomy.heightCm,
    riderWeightKg: anatomy.weightKg,
    crankLengthMm: current?.crankLengthMm ?? DEFAULT_PROFILE.crankLengthMm,
    currentSaddleHeightMm: current?.saddleHeightMm ?? null,
    currentBarWidthMm: current?.handlebarWidthMm ?? null,
    discipline: passport.discipline,
    ridingStyle: passport.postureStyle,
    currentPains: [...passport.symptoms],
    stockBike: currentBike?.stock ?? null,
  };
}

/** Columns of `rider_profiles` for the owner's row (timestamps are set by the database). */
export function passportToRow(userId: string, passport: RiderPassport): RiderProfileRow {
  return {
    id: userId,
    discipline: passport.discipline,
    posture_style: passport.postureStyle,
    anatomy: passport.anatomy,
    symptoms: passport.symptoms,
    targets: passport.targets,
    bikes: passport.bikes,
    gear: passport.gear,
  };
}

/** The passport of a database row; null when the row is unusable (see parsePassport). */
export function rowToPassport(row: unknown): RiderPassport | null {
  if (typeof row !== 'object' || row === null) return null;
  const r = row as Partial<RiderProfileRow>;
  return parsePassport({ discipline: r.discipline, postureStyle: r.posture_style, anatomy: r.anatomy, symptoms: r.symptoms, targets: r.targets, bikes: r.bikes, gear: r.gear });
}
