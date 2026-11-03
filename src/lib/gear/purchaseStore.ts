import { parsePurchases, type SavedPurchase } from './savedPurchases';

/** LocalStorage key of the purchases of this browser. */
export const PURCHASES_STORAGE_KEY = 'baik_gear_purchases';

/** The purchases that were written in this tab: they also serve when the browser blocks its storage. */
let memory: string | null = null;
const listeners = new Set<() => void>();

const EMPTY: SavedPurchase[] = [];
let cachedRaw: string | null | undefined;
let cachedList: SavedPurchase[] = EMPTY;

function rawValue(): string | null {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(PURCHASES_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The stored list; the same array for the same stored text, so a component that reads it does not render again for nothing. */
export function readPurchases(): SavedPurchase[] {
  const raw = rawValue();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedList = raw ? parsePurchases(JSON.parse(raw)) : EMPTY;
    } catch {
      cachedList = EMPTY;
    }
  }
  return cachedList;
}

export function writePurchases(list: SavedPurchase[]): void {
  memory = JSON.stringify(list);
  try {
    window.localStorage.setItem(PURCHASES_STORAGE_KEY, memory);
  } catch {
    /* A full or blocked storage keeps the list for this tab only. */
  }
  listeners.forEach((listener) => listener());
}

export function subscribePurchases(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** Forgets what this tab wrote (tests start from a clean browser). */
export function resetPurchaseStore(): void {
  memory = null;
  cachedRaw = undefined;
  cachedList = EMPTY;
  listeners.forEach((listener) => listener());
}
