import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES, type RiderPainType, type RidingDiscipline, type RidingStyle } from '@/types/baikfit';
import { parseStockSelection } from '@/lib/bikes/parseSelection';
import {
  POSTURE_STYLES,
  type PassportAnatomy,
  type PassportBike,
  type PassportGear,
  type PassportTargets,
  type RiderPassport,
} from './types';

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
const MAX_ID_LENGTH = 64;
const MAX_NAME_LENGTH = 80;
const MAX_JSON_LENGTH = 20_000;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const inRange = (value: unknown, [min, max]: readonly [number, number]): value is number => isNumber(value) && value >= min && value <= max;

function isDiscipline(value: unknown): value is RidingDiscipline {
  return (RIDING_DISCIPLINES as readonly unknown[]).includes(value);
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

function parseBike(raw: unknown): PassportBike | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || raw.id.length === 0 || raw.id.length > MAX_ID_LENGTH) return null;
  if (raw.kind !== 'current' && raw.kind !== 'candidate') return null;
  const bike: PassportBike = { id: raw.id, kind: raw.kind };
  if (typeof raw.name === 'string') bike.name = raw.name.slice(0, MAX_NAME_LENGTH);
  if (isObject(raw.frame)) bike.frame = { stackMm: optionalNumber(raw.frame.stackMm), reachMm: optionalNumber(raw.frame.reachMm) };
  if (isObject(raw.components)) {
    bike.components = {
      saddleHeightMm: nullableNumber(raw.components.saddleHeightMm),
      handlebarWidthMm: nullableNumber(raw.components.handlebarWidthMm),
      crankLengthMm: optionalNumber(raw.components.crankLengthMm),
    };
  }
  const stock = parseStockSelection(raw.stock);
  if (stock) bike.stock = stock;
  return bike;
}

function parseBikes(raw: unknown): PassportBike[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_BIKES).map(parseBike).filter((bike): bike is PassportBike => bike !== null);
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

function parseGear(raw: unknown): PassportGear {
  return isObject(raw) ? raw : {};
}

/**
 * Checks and normalizes a passport that came from LocalStorage or from the database. Returns null when the
 * document is unusable (unknown discipline or style, missing or implausible required measurements, oversized);
 * otherwise optional parts that are malformed are replaced by safe defaults.
 */
export function parsePassport(raw: unknown): RiderPassport | null {
  if (!isObject(raw) || JSON.stringify(raw).length > MAX_JSON_LENGTH) return null;
  const anatomy = parseAnatomy(raw.anatomy);
  if (!anatomy || !isDiscipline(raw.discipline) || !isStyle(raw.postureStyle)) return null;
  return {
    discipline: raw.discipline,
    postureStyle: raw.postureStyle,
    anatomy,
    symptoms: parseSymptoms(raw.symptoms),
    targets: parseTargets(raw.targets),
    bikes: parseBikes(raw.bikes),
    gear: parseGear(raw.gear),
  };
}
