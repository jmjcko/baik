import type { BikeFitCoordinates } from '@/types/baikfit';
import type { BikeProfile } from '@/lib/passport/types';
import type { BikeIdentity, FitSummary } from '@/types/service';

/** The numbers of the fit that the garage shows: the targets of bAIkfit, the crank length and the handlebar width the rider reported (null when not given). */
export function fitSummary(coordinates: BikeFitCoordinates, values: { crankLengthMm: number; currentBarWidthMm: number | null }): FitSummary {
  return {
    crankLengthMm: values.crankLengthMm,
    saddleHeightMm: coordinates.saddle.heightAlongTubeMm,
    setbackMm: Math.abs(coordinates.saddle.setbackXMm),
    stackMm: coordinates.cockpit.stackYMm,
    reachMm: coordinates.cockpit.reachXMm,
    barWidthMm: values.currentBarWidthMm,
  };
}

/**
 * What the garage knows about the bike for the passport: the brand, model and year of its factory setup. When the rider named the bike and the
 * name does not contain the brand of the factory setup, the two point at different bikes: the rider's name wins and nothing is filled in.
 */
export function knownFromBike(bike: Pick<BikeProfile, 'name' | 'brand' | 'model' | 'year'> | undefined): Partial<BikeIdentity> | undefined {
  if (!bike || (!bike.brand && !bike.model && !bike.year)) return undefined;
  if (bike.name && bike.brand && !bike.name.toLowerCase().includes(bike.brand.toLowerCase())) return undefined;
  return { make: bike.brand ?? undefined, model: bike.model ?? undefined, year: bike.year };
}
