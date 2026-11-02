import { PASSPORT_STORAGE_KEY } from '@/lib/passport/localStore';
import { activeBikeOf } from '@/lib/passport/garage';
import { activeRiderOf } from '@/lib/passport/riders';
import type { PassportRider, RiderPassport } from '@/lib/passport/types';

/** The guest's passport as stored in the browser by the app, or null when nothing was stored. */
export function storedPassport(): RiderPassport | null {
  const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { passport: RiderPassport }).passport : null;
}

/** The rider of the active bike of a passport (the body, the pains and the mini-tests), or undefined for none. */
export const riderIn = (passport: RiderPassport | null | undefined): PassportRider | undefined => (passport ? activeRiderOf(passport) : undefined);

/** The calculated targets that are kept with the active bike of a passport. */
export const targetsIn = (passport: RiderPassport | null | undefined) => (passport ? activeBikeOf(passport)?.targets : undefined);
