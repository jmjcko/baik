import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';

/** The values of the studio that the live numbers are computed from. */
export interface StudioSnapshot {
  coordinates: BikeFitCoordinates;
  acromionWidthMm: number;
  crankLengthMm: number;
}

export type StudioMetric = 'saddle' | 'setback' | 'stack' | 'reach' | 'crank';

/** Change of every live number of the simulator against the rider's profile (the report). */
export function studioDeltas(now: StudioSnapshot, reference: StudioSnapshot): Record<StudioMetric, number> {
  return {
    saddle: now.coordinates.saddle.heightAlongTubeMm - reference.coordinates.saddle.heightAlongTubeMm,
    setback: now.coordinates.saddle.setbackXMm - reference.coordinates.saddle.setbackXMm,
    stack: now.coordinates.cockpit.stackYMm - reference.coordinates.cockpit.stackYMm,
    reach: now.coordinates.cockpit.reachXMm - reference.coordinates.cockpit.reachXMm,
    crank: now.crankLengthMm - reference.crankLengthMm,
  };
}

/** Text of a change badge such as "+11 mm vs report"; null when nothing changed. */
export function formatDelta(deltaMm: number, suffix: string): string | null {
  const rounded = Math.round(deltaMm * 10) / 10;
  if (rounded === 0) return null;
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} mm ${suffix}`;
}
