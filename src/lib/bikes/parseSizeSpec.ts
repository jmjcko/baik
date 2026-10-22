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

const REQUIRED: Key[] = ['frameStackMm', 'frameReachMm', 'seatTubeAngleDeg'];
const OPTIONAL: Key[] = ['topTubeMm', 'headTubeMm'];
const STOCK: Key[] = ['stockStemMm', 'stockHandlebarMm', 'stockCrankMm', 'stockSeatpostOffsetMm', 'stockSpacersMm'];

const inRange = (raw: unknown, key: Key): raw is number =>
  typeof raw === 'number' && Number.isFinite(raw) && raw >= SIZE_LIMITS[key][0] && raw <= SIZE_LIMITS[key][1];

/**
 * Checks a size that came from storage or from the AI: the three required numbers must be plausible; an optional
 * number that is missing or implausible is dropped, a stock component that is missing or implausible becomes null
 * (never a guess). Returns null when the size is unusable.
 */
export function parseSizeSpec(raw: unknown): SizeSpec | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;
  if (!REQUIRED.every((key) => inRange(source[key], key))) return null;
  const spec: Record<string, number | null> = {};
  for (const key of REQUIRED) spec[key] = source[key] as number;
  for (const key of OPTIONAL) if (inRange(source[key], key)) spec[key] = source[key];
  for (const key of STOCK) spec[key] = inRange(source[key], key) ? source[key] : null;
  return spec as unknown as SizeSpec;
}
