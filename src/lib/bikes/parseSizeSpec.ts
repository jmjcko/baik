import type { SizeSpec } from './types';

/** Plausible ranges of a road bike size (the seed guard test uses the same ones); anything outside is refused. */
export const SIZE_LIMITS = {
  frameStackMm: [450, 720],
  frameReachMm: [320, 480],
  seatTubeAngleDeg: [70, 78],
  topTubeMm: [450, 650],
  headTubeMm: [70, 260],
  stockStemMm: [40, 150],
  stockHandlebarMm: [320, 480],
  stockCrankMm: [140, 185],
  stockSeatpostOffsetMm: [-10, 40],
  stockSpacersMm: [0, 60],
} as const;

type Key = keyof typeof SIZE_LIMITS;
export type SizeLimits = Record<Key, readonly [number, number]>;

/** A mountain bike has a longer reach, a flat bar up to 820 mm and a shorter stem; the seed loader uses these for the mtb category only. */
export const MTB_SIZE_LIMITS: SizeLimits = { ...SIZE_LIMITS, frameReachMm: [320, 540], topTubeMm: [450, 700], stockStemMm: [30, 150], stockHandlebarMm: [320, 820] };

const REQUIRED: Key[] = ['frameStackMm', 'frameReachMm', 'seatTubeAngleDeg'];
const OPTIONAL: Key[] = ['topTubeMm', 'headTubeMm'];
const STOCK: Key[] = ['stockStemMm', 'stockHandlebarMm', 'stockCrankMm', 'stockSeatpostOffsetMm', 'stockSpacersMm'];

const inRange = (raw: unknown, key: Key, limits: SizeLimits): raw is number =>
  typeof raw === 'number' && Number.isFinite(raw) && raw >= limits[key][0] && raw <= limits[key][1];

/**
 * Checks a size that came from storage or from the AI: the three required numbers must be plausible; an optional
 * number that is missing or implausible is dropped, a stock component that is missing or implausible becomes null
 * (never a guess). Returns null when the size is unusable.
 */
export function parseSizeSpec(raw: unknown, limits: SizeLimits = SIZE_LIMITS): SizeSpec | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (!REQUIRED.every((key) => inRange(source[key], key, limits))) return null;
  const spec: Record<string, number | null> = {};
  for (const key of REQUIRED) spec[key] = source[key] as number;
  for (const key of OPTIONAL) if (inRange(source[key], key, limits)) spec[key] = source[key];
  for (const key of STOCK) spec[key] = inRange(source[key], key, limits) ? source[key] : null;
  return spec as unknown as SizeSpec;
}
