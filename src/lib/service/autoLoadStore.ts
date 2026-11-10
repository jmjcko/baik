/** LocalStorage key of the time of the last automatic load of the rides of each bike on this device. */
export const AUTOLOAD_KEY = 'baik_ride_autoload';

/** The rides load by themselves when the app opens, but not more often than this (Strava and Intervals.icu both limit how often an app may ask). */
export const AUTOLOAD_HOURS = 6;

const memory = new Map<string, number>();

function read(): Record<string, number> {
  try {
    const data = JSON.parse(window.localStorage.getItem(AUTOLOAD_KEY) ?? 'null') as Record<string, unknown> | null;
    return Object.fromEntries(Object.entries(data ?? {}).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));
  } catch {
    return {};
  }
}

/** Whether the rides of this bike were last loaded automatically more than `AUTOLOAD_HOURS` ago (or never on this device). */
export function dueForAutoLoad(bikeId: string, now: number = Date.now()): boolean {
  const last = memory.get(bikeId) ?? read()[bikeId];
  return last === undefined || now - last >= AUTOLOAD_HOURS * 3_600_000;
}

/** Notes that the rides of this bike were loaded just now. */
export function markAutoLoaded(bikeId: string, now: number = Date.now()): void {
  memory.set(bikeId, now);
  try {
    window.localStorage.setItem(AUTOLOAD_KEY, JSON.stringify({ ...read(), [bikeId]: now }));
  } catch {
    /* private window or blocked storage: the memory of this tab keeps the time */
  }
}

/** Forgets the times (tests start from a clean browser). */
export function resetAutoLoad(): void {
  memory.clear();
}
