import type { UpgradeRange } from './types';

/** A range as the rider reads it: "28 to 32 mm" is written "28–32 mm", one value "380 mm", an angle "8–15°". */
export function rangeText(range: UpgradeRange): string {
  const values = range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
  return range.unit === 'deg' ? `${values}°` : `${values} ${range.unit}`;
}
