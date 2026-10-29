import { CUSTOM_LIMITS, CUSTOM_SETUP_KEYS, isSetupMode, type CustomSetup, type SetupMode } from '@/lib/engines/baikfit/customSetup';

/** The measurements of a modified bike (Epic 34) inside the plausible limits; anything else is left out (not measured). */
export function parseCustomSetup(raw: Record<string, unknown>): Partial<CustomSetup> {
  const parsed: Partial<CustomSetup> = {};
  for (const key of CUSTOM_SETUP_KEYS) {
    const value = raw[key];
    const [min, max] = CUSTOM_LIMITS[key];
    if (value === null) parsed[key] = null;
    else if (typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max) parsed[key] = value;
  }
  return parsed;
}

/** The setup mode of a stored bike; undefined for a bike stored before (it is a series bike). */
export const parseSetupMode = (raw: unknown): SetupMode | undefined => (isSetupMode(raw) ? raw : undefined);
