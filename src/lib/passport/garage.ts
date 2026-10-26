import { resolveStockBike } from '@/lib/bikes/resolve';
import type { RidingDiscipline } from '@/types/baikfit';
import type { BikeProfile, PassportBike, RiderPassport } from './types';

/** At most this many bikes are stored (the same limit as the parser). */
export const MAX_GARAGE_BIKES = 20;
export const MAX_BIKE_NAME_LENGTH = 80;

/** The bikes of the rider's garage (bikes of kind "current"; "candidate" bikes belong to the pre-purchase path). */
export const garageOf = (passport: RiderPassport): PassportBike[] => passport.bikes.filter((bike) => bike.kind === 'current');

/** The bike that the wizard, the report and the studio work with. */
export const activeBikeOf = (passport: RiderPassport): PassportBike | undefined => passport.bikes.find((bike) => bike.id === passport.activeBikeId);

/** Makes another garage bike the active one (and its discipline the discipline of the passport); null when there is no such bike. The numbers of the bike that was active stay in the passport. */
export function switchActiveBike(passport: RiderPassport, bikeId: string): RiderPassport | null {
  const bike = garageOf(passport).find((candidate) => candidate.id === bikeId);
  return bike ? { ...passport, activeBikeId: bikeId, discipline: bike.discipline ?? passport.discipline } : null;
}

/** A new, empty garage bike of a kind that becomes the active one; null for an empty or too long name, a repeated id, or a full garage. */
export function addGarageBike(passport: RiderPassport, name: string, bikeId: string, discipline: RidingDiscipline = passport.discipline): RiderPassport | null {
  const trimmed = name.trim();
  if (trimmed === '' || trimmed.length > MAX_BIKE_NAME_LENGTH || passport.bikes.length >= MAX_GARAGE_BIKES) return null;
  if (bikeId === '' || passport.bikes.some((bike) => bike.id === bikeId)) return null;
  return { ...passport, bikes: [...passport.bikes, { id: bikeId, kind: 'current', name: trimmed, discipline }], activeBikeId: bikeId, discipline };
}

/** Gives a garage bike another name; null for an empty or too long name or a bike that is not in the garage. */
export function renameGarageBike(passport: RiderPassport, bikeId: string, name: string): RiderPassport | null {
  const trimmed = name.trim();
  if (trimmed === '' || trimmed.length > MAX_BIKE_NAME_LENGTH || !garageOf(passport).some((bike) => bike.id === bikeId)) return null;
  return { ...passport, bikes: passport.bikes.map((bike) => (bike.id === bikeId ? { ...bike, name: trimmed } : bike)) };
}

/** Whether a bike may be deleted: it must be in the garage, not the active bike and not the only one (switch to another bike first). */
export const canRemoveGarageBike = (passport: RiderPassport, bikeId: string): boolean =>
  bikeId !== passport.activeBikeId && garageOf(passport).length > 1 && garageOf(passport).some((bike) => bike.id === bikeId);

/** The passport without that bike (with its numbers and diagnosis); null when it may not be deleted. */
export function removeGarageBike(passport: RiderPassport, bikeId: string): RiderPassport | null {
  return canRemoveGarageBike(passport, bikeId) ? { ...passport, bikes: passport.bikes.filter((bike) => bike.id !== bikeId) } : null;
}

/** The bike as the profile page shows it: the name, year and size (from the factory setup), whether it is a factory bike, and the last diagnosis. */
export function describeBike(bike: PassportBike, activeBikeId: string, fallback: RidingDiscipline = 'road'): BikeProfile {
  const discipline = bike.discipline ?? fallback;
  const resolved = resolveStockBike(bike.stock ?? null, discipline === 'xc_mtb' ? 'road' : discipline);
  return {
    id: bike.id,
    name: bike.name ?? null,
    factoryName: resolved ? `${resolved.bike.brand} ${resolved.bike.model}` : null,
    year: resolved?.bike.years[0] ?? null,
    size: resolved?.size ?? null,
    isStock: resolved !== null,
    diagnosis: bike.diagnosis ?? null,
    isActive: bike.id === activeBikeId,
    discipline,
  };
}

/** The garage with the active bike first of all, in the order the rider added the bikes otherwise. */
export function garageProfiles(passport: RiderPassport): BikeProfile[] {
  const bikes = garageOf(passport).map((bike) => describeBike(bike, passport.activeBikeId, passport.discipline));
  return [...bikes.filter((bike) => bike.isActive), ...bikes.filter((bike) => !bike.isActive)];
}
