import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, KB_VERSION, recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';
import { DEFAULT_MTB_SETUP, flatBarTargetMm } from '@/lib/engines/baikfit/mtb';
import { CUSTOM_SETUP_KEYS, type CustomSetup } from '@/lib/engines/baikfit/customSetup';
import { isDefaultCare } from './parseCare';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/profile/values';
import { parsePassport } from './parse';
import { DEFAULT_CARE } from '@/types/maintain';
import { CURRENT_BIKE_ID, DEFAULT_RIDER_ID, type PassportBike, type PassportMobility, type PassportTargets, type RiderPassport, type PassportRider, type RiderProfileRow } from './types';
import { activeRiderOf } from './riders';
import { activeBikeOf } from './garage';

export { CURRENT_BIKE_ID };

/** Snapshot of the calculated targets (from the KB rules) for the modules that only read the passport. */
export function buildTargetsSnapshot(values: Pick<ProfileValues, 'acromionWidthMm'> & Partial<Pick<ProfileValues, 'discipline' | 'mtb'>>, coordinates: BikeFitCoordinates): PassportTargets {
  return {
    saddleHeightMm: coordinates.saddle.heightAlongTubeMm,
    saddleSetbackMm: coordinates.saddle.setbackXMm,
    saddlePitchDeg: KB_RULES.saddlePitchMaxNoseDownDeg,
    cockpitStackMm: coordinates.cockpit.stackYMm,
    cockpitReachMm: coordinates.cockpit.reachXMm,
    handlebarWidthMm: values.discipline === 'xc_mtb' ? flatBarTargetMm(values.acromionWidthMm, (values.mtb ?? DEFAULT_MTB_SETUP).style) : recommendedBarWidthMm(values.acromionWidthMm),
    crankLengthMm: KB_RULES.crankRangeMm.max,
    cleatSetbackMm: { min: KB_RULES.cleatSetbackMm.min, max: KB_RULES.cleatSetbackMm.max },
    kbVersion: KB_VERSION,
  };
}

/** The active bike of the wizard values; its name and frame (not collected by the wizard) are kept from the bike that was there before. */
function activeBike(values: ProfileValues, id: string, riderId: string, targets: PassportTargets, before: PassportBike | undefined): PassportBike {
  return {
    id,
    kind: 'current',
    primaryRiderId: riderId,
    ridingStyle: values.ridingStyle,
    targets,
    ...(before?.name ? { name: before.name } : {}),
    ...(before?.frame ? { frame: before.frame } : {}),
    components: {
      saddleHeightMm: values.currentSaddleHeightMm,
      handlebarWidthMm: values.currentBarWidthMm,
      crankLengthMm: values.crankLengthMm,
      ...(values.setupMode === 'custom' ? values.custom : {}),
    },
    ...(values.setupMode === 'custom' ? { setupMode: values.setupMode } : {}),
    ...(isDefaultCare(values.care) ? {} : { care: values.care }),
    ...(values.stockBike ? { stock: values.stockBike } : {}),
    ...(values.lastDiagnosis ? { diagnosis: values.lastDiagnosis } : {}),
    ...(values.discipline === 'xc_mtb' || before?.mtb ? { mtb: values.mtb } : {}),
    discipline: values.discipline,
  };
}

/** The garage with the active bike written from the wizard values; the other bikes stay as they were. */
function bikesOf(values: ProfileValues, riderId: string, targets: PassportTargets, previous: RiderPassport | null | undefined): { bikes: PassportBike[]; activeBikeId: string } {
  const activeBikeId = previous?.activeBikeId ?? CURRENT_BIKE_ID;
  const before = previous?.bikes ?? [];
  const written = activeBike(values, activeBikeId, riderId, targets, before.find((bike) => bike.id === activeBikeId));
  const known = before.some((bike) => bike.id === activeBikeId);
  return { bikes: known ? before.map((bike) => (bike.id === activeBikeId ? written : bike)) : [written, ...before], activeBikeId };
}

/** The mini-test answers of the wizard values; nothing when neither test was done. */
function mobilityOf(values: ProfileValues): { mobility?: PassportMobility } {
  if (!values.hamstringTest && !values.releaseTest) return {};
  return { mobility: { ...(values.hamstringTest ? { hamstring: values.hamstringTest } : {}), ...(values.releaseTest ? { release: values.releaseTest } : {}) } };
}

/** The rider of the wizard values: the body, the pains and the tests of the rider who was active, the other measurements of that rider kept. */
function riderOf(values: ProfileValues, before: PassportRider | undefined): PassportRider {
  return {
    id: before?.id ?? DEFAULT_RIDER_ID,
    name: before?.name ?? null,
    anatomy: {
      ...before?.anatomy,
      inseamMm: values.inseamMm,
      acromionWidthMm: values.acromionWidthMm,
      torsoLengthMm: values.torsoLengthMm,
      armLengthMm: values.armLengthMm,
      heightCm: values.heightCm,
      weightKg: values.riderWeightKg,
    },
    symptoms: [...values.currentPains],
    ...mobilityOf(values),
  };
}

/**
 * Builds the passport of the wizard values: the values are the pair [active rider, active bike], so the body goes to the
 * active rider and the bike values and the targets go to the active bike. Whatever the wizard does not collect (optional
 * measurements, gear, other riders and bikes) is kept from the passport that was there before.
 */
export function profileToPassport(values: ProfileValues, coordinates: BikeFitCoordinates, previous?: RiderPassport | null): RiderPassport {
  const before = previous ? activeRiderOf(previous) : undefined;
  const rider = riderOf(values, before);
  return {
    discipline: values.discipline,
    riders: previous ? previous.riders.map((other) => (other.id === rider.id ? rider : other)) : [rider],
    ...bikesOf(values, rider.id, buildTargetsSnapshot(values, coordinates), previous),
    gear: previous?.gear ?? {},
  };
}

/** The measurements of a modified bike from the stored components; what was not measured stays null. */
function customOf(components: PassportBike['components']): CustomSetup {
  return Object.fromEntries(CUSTOM_SETUP_KEYS.map((key) => [key, components?.[key] ?? null])) as unknown as CustomSetup;
}

/** The wizard values of a passport (what the report and the studio work with). */
export function passportToProfile(passport: RiderPassport): ProfileValues {
  const currentBike = passport.bikes.find((bike) => bike.id === passport.activeBikeId);
  const current = currentBike?.components;
  const { anatomy, symptoms, mobility } = activeRiderOf(passport);
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
    discipline: currentBike?.discipline ?? passport.discipline,
    ridingStyle: currentBike?.ridingStyle ?? DEFAULT_PROFILE.ridingStyle,
    currentPains: [...symptoms],
    stockBike: currentBike?.stock ?? null,
    lastDiagnosis: currentBike?.diagnosis ?? null,
    hamstringTest: mobility?.hamstring ?? null,
    releaseTest: mobility?.release ?? null,
    mtb: currentBike?.mtb ?? DEFAULT_MTB_SETUP,
    setupMode: currentBike?.setupMode ?? 'stock',
    custom: customOf(current),
    care: currentBike?.care ?? DEFAULT_CARE,
  };
}

/**
 * Columns of `rider_profiles` for the owner's row (timestamps are set by the database). A version 2 row keeps the people in
 * `riders`; the version 1 columns for the body and the targets are written empty, so no second copy of the body stays behind.
 */
export function passportToRow(userId: string, passport: RiderPassport): RiderProfileRow {
  return {
    id: userId,
    discipline: passport.discipline,
    posture_style: activeBikeOf(passport)?.ridingStyle ?? DEFAULT_PROFILE.ridingStyle,
    anatomy: {},
    symptoms: [],
    targets: null,
    riders: passport.riders,
    bikes: passport.bikes.map((bike) => (bike.id === passport.activeBikeId ? { ...bike, active: true } : bike)),
    gear: passport.gear,
  };
}

/** The mini-test answers sit in the `gear` column (no new column): they are lifted out when a row is read. */
function splitGear(gear: unknown): { gear: unknown; mobility: unknown } {
  if (typeof gear !== 'object' || gear === null || Array.isArray(gear)) return { gear, mobility: undefined };
  const { mobility, ...rest } = gear as Record<string, unknown>;
  return { gear: rest, mobility };
}

/** The id of the bike that a stored row marks as active (the column holds an array of bikes, so the mark sits on the bike), or undefined. */
function activeIdOf(bikes: unknown): string | undefined {
  const marked = Array.isArray(bikes) ? bikes.find((bike) => typeof bike === 'object' && bike !== null && (bike as { active?: unknown }).active === true) : undefined;
  const id = (marked as { id?: unknown } | undefined)?.id;
  return typeof id === 'string' ? id : undefined;
}

/** The passport of a database row (version 2 with `riders`, or a version 1 row that is migrated); null when the row is unusable (see parsePassport). */
export function rowToPassport(row: unknown): RiderPassport | null {
  if (typeof row !== 'object' || row === null) return null;
  const r = row as Partial<RiderProfileRow>;
  const activeBikeId = activeIdOf(r.bikes);
  if (Array.isArray(r.riders)) return parsePassport({ discipline: r.discipline, riders: r.riders, bikes: r.bikes, activeBikeId, gear: r.gear });
  const { gear, mobility } = splitGear(r.gear);
  return parsePassport({ discipline: r.discipline, postureStyle: r.posture_style, anatomy: r.anatomy, symptoms: r.symptoms, targets: r.targets, bikes: r.bikes, activeBikeId, mobility, gear });
}
