import { PASSPORT_STORAGE_KEY } from '@/lib/passport/localStore';
import type { RiderPassport } from '@/lib/passport/types';

/** The guest's passport as stored in the browser by the app, or null when nothing was stored. */
export function storedPassport(): RiderPassport | null {
  const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { passport: RiderPassport }).passport : null;
}
