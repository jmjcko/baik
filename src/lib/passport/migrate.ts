import { DEFAULT_RIDER_ID } from './types';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

/** True for a document in the shape of version 2 (it has the people of the account). */
export const isVersion2 = (raw: unknown): boolean => isObject(raw) && Array.isArray(raw.riders);

/** The active bike of a version 1 document: the stored id when it is a garage bike, else the first garage bike (as the parser does). */
function activeGarageId(raw: Json): unknown {
  const garage = Array.isArray(raw.bikes) ? raw.bikes.filter((bike) => isObject(bike) && bike.kind === 'current') : [];
  return garage.some((bike) => (bike as Json).id === raw.activeBikeId) ? raw.activeBikeId : (garage[0] as Json | undefined)?.id;
}

/** A bike of version 1 takes the rider "me", the posture of the passport and (for the active one) the targets; nothing else changes. */
function migrateBike(bike: unknown, raw: Json, activeId: unknown): unknown {
  if (!isObject(bike) || bike.kind !== 'current') return bike;
  return {
    ...bike,
    primaryRiderId: DEFAULT_RIDER_ID,
    ridingStyle: raw.postureStyle,
    ...(bike.id === activeId && raw.targets ? { targets: raw.targets } : {}),
  };
}

/**
 * A version 1 document (one body for the account, the posture and the targets at the top) as a version 2 document: one
 * rider "me" with the body, the pains and the mini-tests, and the posture and targets on the bikes. Pure and idempotent
 * (a version 2 document comes back as it is); the result is still unchecked, `parsePassport` validates it.
 */
export function migratePassport(raw: unknown): unknown {
  if (!isObject(raw) || isVersion2(raw)) return raw;
  const activeId = activeGarageId(raw);
  const bikes = Array.isArray(raw.bikes) ? raw.bikes.map((bike) => migrateBike(bike, raw, activeId)) : raw.bikes;
  const rider = { id: DEFAULT_RIDER_ID, name: null, anatomy: raw.anatomy, symptoms: raw.symptoms, ...(raw.mobility ? { mobility: raw.mobility } : {}) };
  return { discipline: raw.discipline, riders: [rider], bikes, activeBikeId: raw.activeBikeId, gear: raw.gear };
}
