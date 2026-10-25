import { DEFAULT_MTB_SETUP, MTB_LIMITS, MTB_STYLES, inLimits, type MtbSetup } from '@/lib/engines/baikfit/mtb';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const limited = (value: unknown, limits: readonly [number, number]): number | null => (typeof value === 'number' && inLimits(value, limits) ? value : null);

/** The MTB setup of a stored bike: a known style, a flag, and numbers inside the plausible limits (anything else becomes "not entered"); undefined when there is no object. */
export function parseMtbSetup(raw: unknown): MtbSetup | undefined {
  if (!isObject(raw)) return undefined;
  return {
    style: MTB_STYLES.find((style) => style === raw.style) ?? DEFAULT_MTB_SETUP.style,
    fullSuspension: raw.fullSuspension === true,
    travelMm: limited(raw.travelMm, MTB_LIMITS.travelMm),
    sagPercent: limited(raw.sagPercent, MTB_LIMITS.sagPercent),
    dropperTravelMm: limited(raw.dropperTravelMm, MTB_LIMITS.dropperTravelMm),
  };
}
