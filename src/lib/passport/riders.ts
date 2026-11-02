import type { RidingDiscipline } from '@/types/baikfit';
import { addGarageBike, activeBikeOf, garageOf } from './garage';
import type { PassportAnatomy, PassportBike, PassportRider, RiderPassport, RiderSummary } from './types';


/** At most this many people are stored (the same limit as the parser). */
export const MAX_RIDERS = 10;
export const MAX_RIDER_NAME_LENGTH = 80;

/** The body of a rider whose measurements have not been entered yet (the defaults of the wizard). */
const STARTING_ANATOMY: PassportAnatomy = { inseamMm: 840, acromionWidthMm: 420, torsoLengthMm: 620, armLengthMm: 620, heightCm: 178, weightKg: 75 };

/** The rider of a bike: its primary rider, or the first rider when the bike has none (an older document). */
export const riderOfBike = (passport: RiderPassport, bike: PassportBike | undefined): PassportRider =>
  passport.riders.find((rider) => rider.id === bike?.primaryRiderId) ?? passport.riders[0];

/** The rider that the wizard, the report and the studio work with: the rider of the active bike. */
export const activeRiderOf = (passport: RiderPassport): PassportRider => riderOfBike(passport, activeBikeOf(passport));

/** The garage bikes of a rider. */
export const bikesOfRider = (passport: RiderPassport, riderId: string): PassportBike[] => garageOf(passport).filter((bike) => riderOfBike(passport, bike).id === riderId);

const cleanName = (name: string): string => name.trim();

const nameTaken = (passport: RiderPassport, name: string, exceptId?: string): boolean =>
  passport.riders.some((rider) => rider.id !== exceptId && rider.name !== null && rider.name.toLowerCase() === name.toLowerCase());

/**
 * A new rider with the first bike of that rider, which becomes the active bike (so the rider becomes the active rider);
 * null for an empty, too long or repeated name, an empty bike name, a repeated id, or when the account is full. The
 * measurements start from the defaults of the wizard and are entered there.
 */
export function addRider(passport: RiderPassport, input: { riderId: string; name: string; bikeId: string; bikeName: string; discipline: RidingDiscipline }): RiderPassport | null {
  const name = cleanName(input.name);
  if (name === '' || name.length > MAX_RIDER_NAME_LENGTH || nameTaken(passport, name)) return null;
  if (input.riderId === '' || passport.riders.length >= MAX_RIDERS || passport.riders.some((rider) => rider.id === input.riderId)) return null;
  const withRider: RiderPassport = { ...passport, riders: [...passport.riders, { id: input.riderId, name, anatomy: { ...STARTING_ANATOMY }, symptoms: [] }] };
  return addGarageBike(withRider, input.bikeName, input.bikeId, input.discipline, false, input.riderId);
}

/** Gives a rider another name; null for an empty, too long or repeated name or a rider that is not there. */
export function renameRider(passport: RiderPassport, riderId: string, name: string): RiderPassport | null {
  const trimmed = cleanName(name);
  if (trimmed === '' || trimmed.length > MAX_RIDER_NAME_LENGTH || nameTaken(passport, trimmed, riderId) || !passport.riders.some((rider) => rider.id === riderId)) return null;
  return { ...passport, riders: passport.riders.map((rider) => (rider.id === riderId ? { ...rider, name: trimmed } : rider)) };
}

/** Whether a rider may be removed: it must be there and not the last one. */
export const canRemoveRider = (passport: RiderPassport, riderId: string): boolean => passport.riders.length > 1 && passport.riders.some((rider) => rider.id === riderId);

/** The passport without that rider (with the body, pains and tests); the bikes of the rider go to `takeoverId`, which must be another rider. Null when that is not possible. */
export function removeRider(passport: RiderPassport, riderId: string, takeoverId: string): RiderPassport | null {
  if (!canRemoveRider(passport, riderId) || takeoverId === riderId || !passport.riders.some((rider) => rider.id === takeoverId)) return null;
  const bikes = passport.bikes.map((bike) => (bike.primaryRiderId === riderId || (bike.kind === 'current' && riderOfBike(passport, bike).id === riderId) ? { ...bike, primaryRiderId: takeoverId } : bike));
  return { ...passport, riders: passport.riders.filter((rider) => rider.id !== riderId), bikes };
}

/** Gives a garage bike to another rider; null when the bike is not in the garage or the rider is not there. */
export function assignBikeRider(passport: RiderPassport, bikeId: string, riderId: string): RiderPassport | null {
  if (!garageOf(passport).some((bike) => bike.id === bikeId) || !passport.riders.some((rider) => rider.id === riderId)) return null;
  return { ...passport, bikes: passport.bikes.map((bike) => (bike.id === bikeId ? { ...bike, primaryRiderId: riderId } : bike)) };
}

/** Makes another rider the active one by making the active bike of that rider (or the first one) the active bike; null when the rider has no bike. */
export function switchActiveRider(passport: RiderPassport, riderId: string): RiderPassport | null {
  const bikes = bikesOfRider(passport, riderId);
  const target = bikes.find((bike) => bike.id === passport.activeBikeId) ?? bikes[0];
  return target ? { ...passport, activeBikeId: target.id, discipline: target.discipline ?? passport.discipline } : null;
}

/** The people of the account for the screens, in the order they were added (the order does not change when another rider becomes active); each with the id of the bikes. */
export function riderSummaries(passport: RiderPassport): RiderSummary[] {
  const activeId = activeRiderOf(passport).id;
  return passport.riders.map((rider) => ({ id: rider.id, name: rider.name, isActive: rider.id === activeId, bikeIds: bikesOfRider(passport, rider.id).map((bike) => bike.id) }));
}
