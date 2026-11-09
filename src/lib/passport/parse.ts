import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES, type RiderPainType, type RidingDiscipline, type RidingStyle } from '@/types/baikfit';
import { parseMtbSetup } from './parseMtb';
import { parseCustomSetup, parseSetupMode } from './parseCustom';
import { parseCare } from './parseCare';
import { parseStockSelection } from '@/lib/bikes/parseSelection';
import { HAMSTRING_LEVELS, RELEASE_RESULTS } from '@/lib/engines/baikfit/mobility';
import {
  POSTURE_STYLES,
  type PassportAnatomy,
  CURRENT_BIKE_ID,
  type BikeDiagnosis,
  type PassportBike,
  type PassportGear,
  type PassportMobility,
  type PassportTargets,
  type RiderPassport,
  type PassportRider,
} from './types';
import { isVersion2, migratePassport } from './migrate';

/** Plausible ranges of the stored measurements; anything outside is refused (input validation of local and remote data). */
export const ANATOMY_LIMITS = {
  inseamMm: [500, 1100],
  acromionWidthMm: [300, 560],
  torsoLengthMm: [350, 900],
  armLengthMm: [400, 900],
  heightCm: [120, 230],
  weightKg: [30, 250],
  footLengthMm: [180, 340],
  footWidthMm: [60, 150],
  chestCircumferenceCm: [50, 200],
  waistCircumferenceCm: [40, 200],
} as const satisfies Record<keyof PassportAnatomy, readonly [number, number]>;

const MAX_BIKES = 20;
const MAX_RIDERS = 10;
const MAX_ID_LENGTH = 64;
const MAX_NAME_LENGTH = 80;
const MAX_JSON_LENGTH = 40_000;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const inRange = (value: unknown, [min, max]: readonly [number, number]): value is number => isNumber(value) && value >= min && value <= max;

/** A discipline that the app no longer has and the one that takes its place (a saved passport must not be lost). */
const LEGACY_DISCIPLINES: Readonly<Record<string, RidingDiscipline>> = { trekking: 'gravel' };

/** The discipline of a stored value: a current one, a replaced one (`trekking` becomes `gravel`), or null. */
export function disciplineOf(value: unknown): RidingDiscipline | null {
  if ((RIDING_DISCIPLINES as readonly unknown[]).includes(value)) return value as RidingDiscipline;
  return typeof value === 'string' ? (LEGACY_DISCIPLINES[value] ?? null) : null;
}

function isStyle(value: unknown): value is RidingStyle {
  return (POSTURE_STYLES as readonly unknown[]).includes(value);
}

const REQUIRED: Array<keyof PassportAnatomy> = ['inseamMm', 'acromionWidthMm', 'torsoLengthMm', 'armLengthMm', 'heightCm', 'weightKg'];
const OPTIONAL: Array<keyof PassportAnatomy> = ['footLengthMm', 'footWidthMm', 'chestCircumferenceCm', 'waistCircumferenceCm'];

/** Required measurements must be present and plausible; optional ones that are implausible are dropped. */
function parseAnatomy(raw: unknown): PassportAnatomy | null {
  if (!isObject(raw)) return null;
  if (!REQUIRED.every((key) => inRange(raw[key], ANATOMY_LIMITS[key]))) return null;
  const anatomy = Object.fromEntries(REQUIRED.map((key) => [key, raw[key]])) as unknown as PassportAnatomy;
  for (const key of OPTIONAL) if (inRange(raw[key], ANATOMY_LIMITS[key])) anatomy[key] = raw[key];
  return anatomy;
}

function parseSymptoms(raw: unknown): RiderPainType[] {
  if (!Array.isArray(raw)) return [];
  return RIDER_PAIN_TYPES.filter((pain) => raw.includes(pain));
}

function optionalNumber(value: unknown): number | undefined {
  return isNumber(value) && value > 0 && value < 5000 ? value : undefined;
}

function nullableNumber(value: unknown): number | null | undefined {
  return value === null ? null : optionalNumber(value);
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DELTA_MM = 300;

const delta = (value: unknown): number | null => (isNumber(value) && Math.abs(value) <= MAX_DELTA_MM ? value : null);

/** The last diagnosis of a bike: a day and two optional deltas; anything else is dropped. */
function parseDiagnosis(raw: unknown): BikeDiagnosis | null {
  if (!isObject(raw) || typeof raw.at !== 'string' || !DAY.test(raw.at)) return null;
  return { at: raw.at, saddleDeltaMm: delta(raw.saddleDeltaMm), spacerDeltaMm: delta(raw.spacerDeltaMm) };
}

/** What a bike says about its rider and its use: the rider, the posture and the targets (Epic 43). */
function parseBikeRider(raw: Json): Pick<PassportBike, 'primaryRiderId' | 'ridingStyle' | 'targets'> {
  const id = raw.primaryRiderId;
  const targets = parseTargets(raw.targets);
  return {
    ...(typeof id === 'string' && id.length > 0 && id.length <= MAX_ID_LENGTH ? { primaryRiderId: id } : {}),
    ...(isStyle(raw.ridingStyle) ? { ridingStyle: raw.ridingStyle } : {}),
    ...(targets ? { targets } : {}),
  };
}

function parseComponents(raw: Json): PassportBike['components'] {
  return {
    saddleHeightMm: nullableNumber(raw.saddleHeightMm),
    handlebarWidthMm: nullableNumber(raw.handlebarWidthMm),
    crankLengthMm: optionalNumber(raw.crankLengthMm),
    ...parseCustomSetup(raw),
  };
}

function parseBike(raw: unknown): PassportBike | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || raw.id.length === 0 || raw.id.length > MAX_ID_LENGTH) return null;
  if (raw.kind !== 'current' && raw.kind !== 'candidate') return null;
  const bike: PassportBike = { id: raw.id, kind: raw.kind, ...parseBikeRider(raw) };
  if (typeof raw.name === 'string') bike.name = raw.name.slice(0, MAX_NAME_LENGTH);
  if (isObject(raw.frame)) bike.frame = { stackMm: optionalNumber(raw.frame.stackMm), reachMm: optionalNumber(raw.frame.reachMm) };
  if (isObject(raw.components)) bike.components = parseComponents(raw.components);
  const setupMode = parseSetupMode(raw.setupMode);
  if (setupMode) bike.setupMode = setupMode;
  const stock = parseStockSelection(raw.stock);
  if (stock) bike.stock = stock;
  const diagnosis = parseDiagnosis(raw.diagnosis);
  if (diagnosis) bike.diagnosis = diagnosis;
  const care = parseCare(raw.care);
  if (care) bike.care = care;
  const mtb = parseMtbSetup(raw.mtb);
  if (mtb) bike.mtb = mtb;
  const discipline = disciplineOf(raw.discipline);
  if (discipline) bike.discipline = discipline;
  return bike;
}

function parseBikes(raw: unknown): PassportBike[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_BIKES).map(parseBike).filter((bike): bike is PassportBike => bike !== null);
}

/** The active bike must be a bike of the garage; an older passport (no field) or a stale id falls back to the first one, or to the bike of path A. */
function parseActiveBikeId(raw: unknown, bikes: PassportBike[]): string {
  const garage = bikes.filter((bike) => bike.kind === 'current');
  return garage.find((bike) => bike.id === raw)?.id ?? garage[0]?.id ?? CURRENT_BIKE_ID;
}

const TARGET_KEYS = ['saddleHeightMm', 'saddleSetbackMm', 'saddlePitchDeg', 'cockpitStackMm', 'cockpitReachMm', 'handlebarWidthMm', 'crankLengthMm'] as const;

/** A snapshot that is not well formed is dropped: the targets are always recalculated from the anatomy. */
function parseTargets(raw: unknown): PassportTargets | null {
  if (!isObject(raw) || typeof raw.kbVersion !== 'string' || !isObject(raw.cleatSetbackMm)) return null;
  const { min, max } = raw.cleatSetbackMm;
  if (!isNumber(min) || !isNumber(max) || !TARGET_KEYS.every((key) => isNumber(raw[key]))) return null;
  const numbers = Object.fromEntries(TARGET_KEYS.map((key) => [key, raw[key]])) as Pick<PassportTargets, (typeof TARGET_KEYS)[number]>;
  return { ...numbers, cleatSetbackMm: { min, max }, kbVersion: raw.kbVersion.slice(0, 32) };
}

const optionalMobility = (raw: unknown): { mobility?: PassportMobility } => {
  const mobility = parseMobility(raw);
  return mobility ? { mobility } : {};
};

/** The mini-test answers; anything that is not a known answer is dropped. */
function parseMobility(raw: unknown): PassportMobility | undefined {
  if (!isObject(raw)) return undefined;
  const mobility: PassportMobility = {};
  const hamstring = HAMSTRING_LEVELS.find((level) => level === raw.hamstring);
  const release = RELEASE_RESULTS.find((result) => result === raw.release);
  if (hamstring) mobility.hamstring = hamstring;
  if (release) mobility.release = release;
  return hamstring || release ? mobility : undefined;
}

function parseGear(raw: unknown): PassportGear {
  return isObject(raw) ? raw : {};
}

/**
 * The setup guide counts as finished when the rider has the mark, or (an account made before the mark existed) when height, inseam and
 * shoulder width were all measured, that is, none of them is still the default of the wizard.
 */
function isSetUp(mark: unknown, anatomy: PassportAnatomy): boolean {
  if (mark === true) return true;
  return anatomy.heightCm !== DEFAULT_PROFILE.heightCm && anatomy.inseamMm !== DEFAULT_PROFILE.inseamMm && anatomy.acromionWidthMm !== DEFAULT_PROFILE.acromionWidthMm;
}

/** A person of the account: an id, a name (or null), the body and the pains; a rider without a plausible body is refused. */
function parseRider(raw: unknown): PassportRider | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || raw.id.length === 0 || raw.id.length > MAX_ID_LENGTH) return null;
  const anatomy = parseAnatomy(raw.anatomy);
  if (!anatomy) return null;
  const name = typeof raw.name === 'string' && raw.name.trim() !== '' ? raw.name.trim().slice(0, MAX_NAME_LENGTH) : null;
  return { id: raw.id, name, anatomy, symptoms: parseSymptoms(raw.symptoms), ...optionalMobility(raw.mobility), ...(isSetUp(raw.setupDone, anatomy) ? { setupDone: true } : {}) };
}

/** The riders of a document: at most ten, each id once. */
function parseRiders(raw: unknown): PassportRider[] {
  if (!Array.isArray(raw)) return [];
  const riders = raw.slice(0, MAX_RIDERS).map(parseRider).filter((rider): rider is PassportRider => rider !== null);
  return riders.filter((rider, index) => riders.findIndex((other) => other.id === rider.id) === index);
}

/** A garage bike of a rider that does not exist (or of none) belongs to the first rider; a garage bike stored before the bikes had a kind takes the discipline of the passport (Epic 30). */
function settleBikes(bikes: PassportBike[], riders: PassportRider[], discipline: RidingDiscipline): PassportBike[] {
  return bikes.map((bike) => {
    if (bike.kind !== 'current') return bike;
    const known = riders.some((rider) => rider.id === bike.primaryRiderId);
    return { ...bike, primaryRiderId: known ? bike.primaryRiderId : riders[0].id, discipline: bike.discipline ?? discipline };
  });
}

/**
 * Checks and normalizes a passport that came from LocalStorage or from the database (version 1 or 2; a version 1
 * document is migrated first). Returns null when the document is unusable (unknown discipline or style, no rider with
 * plausible required measurements, oversized); otherwise optional parts that are malformed are replaced by safe defaults.
 */
export function parsePassport(raw: unknown): RiderPassport | null {
  if (!isObject(raw) || JSON.stringify(raw).length > MAX_JSON_LENGTH) return null;
  if (!isVersion2(raw) && !isStyle(raw.postureStyle)) return null;
  const doc = migratePassport(raw) as Json;
  const discipline = disciplineOf(doc.discipline);
  const riders = parseRiders(doc.riders);
  if (!discipline || riders.length === 0) return null;
  const bikes = settleBikes(parseBikes(doc.bikes), riders, discipline);
  return { discipline, riders, bikes, activeBikeId: parseActiveBikeId(doc.activeBikeId, bikes), gear: parseGear(doc.gear) };
}
