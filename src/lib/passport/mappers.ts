import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, KB_VERSION, recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/profile/values';
import { parsePassport } from './parse';
import { CURRENT_BIKE_ID, type PassportBike, type PassportTargets, type RiderPassport, type RiderProfileRow } from './types';

export { CURRENT_BIKE_ID };

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

/** The active bike of the wizard values; its name and frame (not collected by the wizard) are kept from the bike that was there before. */
function activeBike(values: ProfileValues, id: string, before: PassportBike | undefined): PassportBike {
  return {
    id,
    kind: 'current',
    ...(before?.name ? { name: before.name } : {}),
    ...(before?.frame ? { frame: before.frame } : {}),
    components: {
      saddleHeightMm: values.currentSaddleHeightMm,
      handlebarWidthMm: values.currentBarWidthMm,
      crankLengthMm: values.crankLengthMm,
    },
    ...(values.stockBike ? { stock: values.stockBike } : {}),
    ...(values.lastDiagnosis ? { diagnosis: values.lastDiagnosis } : {}),
  };
}

/** The garage with the active bike written from the wizard values; the other bikes stay as they were. */
function bikesOf(values: ProfileValues, previous: RiderPassport | null | undefined): { bikes: PassportBike[]; activeBikeId: string } {
  const activeBikeId = previous?.activeBikeId ?? CURRENT_BIKE_ID;
  const before = previous?.bikes ?? [];
  const written = activeBike(values, activeBikeId, before.find((bike) => bike.id === activeBikeId));
  const known = before.some((bike) => bike.id === activeBikeId);
  return { bikes: known ? before.map((bike) => (bike.id === activeBikeId ? written : bike)) : [written, ...before], activeBikeId };
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
    ...bikesOf(values, previous),
    gear: previous?.gear ?? {},
  };
}

/** The wizard values of a passport (what the report and the studio work with). */
export function passportToProfile(passport: RiderPassport): ProfileValues {
  const currentBike = passport.bikes.find((bike) => bike.id === passport.activeBikeId);
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
    lastDiagnosis: currentBike?.diagnosis ?? null,
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
    bikes: passport.bikes.map((bike) => (bike.id === passport.activeBikeId ? { ...bike, active: true } : bike)),
    gear: passport.gear,
  };
}

/** The id of the bike that a stored row marks as active (the column holds an array of bikes, so the mark sits on the bike), or undefined. */
function activeIdOf(bikes: unknown): string | undefined {
  const marked = Array.isArray(bikes) ? bikes.find((bike) => typeof bike === 'object' && bike !== null && (bike as { active?: unknown }).active === true) : undefined;
  const id = (marked as { id?: unknown } | undefined)?.id;
  return typeof id === 'string' ? id : undefined;
}

/** The passport of a database row; null when the row is unusable (see parsePassport). */
export function rowToPassport(row: unknown): RiderPassport | null {
  if (typeof row !== 'object' || row === null) return null;
  const r = row as Partial<RiderProfileRow>;
  return parsePassport({ discipline: r.discipline, postureStyle: r.posture_style, anatomy: r.anatomy, symptoms: r.symptoms, targets: r.targets, bikes: r.bikes, activeBikeId: activeIdOf(r.bikes), gear: r.gear });
}
