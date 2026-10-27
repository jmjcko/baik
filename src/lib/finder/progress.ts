import { modelKey } from '@/lib/catalog/key';
import { cleanCandidate, MAX_CANDIDATES } from './candidates';
import { FINDER_CATEGORIES, CATEGORY_PARAMETERS, sanitizeAnswers, type FinderAnswers, type FinderCategory } from './parameters';
import { parseSuppliedBike, type SuppliedBike } from '@/lib/bikes/suppliedBike';
import type { FinderCandidate } from './types';

export const PROGRESS_KEY = 'baik_finder_progress_v1';
export const PROGRESS_VERSION = 1;

/** Where the rider stopped: the answers, the question shown, the suggestions and the geometry tables that the rider supplied (by candidate). */
export interface FinderProgress {
  version: typeof PROGRESS_VERSION;
  category: FinderCategory;
  answers: FinderAnswers;
  step: number;
  candidates: FinderCandidate[];
  tables: Record<string, SuppliedBike>;
  updatedAt: string;
}

export const candidateKey = (candidate: Pick<FinderCandidate, 'brand' | 'model' | 'year'>): string => modelKey(candidate.brand, candidate.model, candidate.year ?? 0);

export const emptyProgress = (category: FinderCategory): FinderProgress => ({ version: PROGRESS_VERSION, category, answers: {}, step: 0, candidates: [], tables: {}, updatedAt: new Date().toISOString() });

function tablesOf(raw: unknown): Record<string, SuppliedBike> {
  const entries = typeof raw === 'object' && raw !== null ? Object.entries(raw as Record<string, unknown>).slice(0, MAX_CANDIDATES) : [];
  return Object.fromEntries(entries.flatMap(([key, value]) => { const bike = parseSuppliedBike(value); return bike ? [[key, bike]] : []; }));
}

/** The saved progress, or null when it is missing, of another version or damaged. Everything in it passes the same checks as a new answer. */
export function parseProgress(raw: unknown): FinderProgress | null {
  const item = (typeof raw === 'object' && raw !== null ? raw : null) as Record<string, unknown> | null;
  const category = FINDER_CATEGORIES.find((candidate) => candidate === item?.category);
  if (!item || item.version !== PROGRESS_VERSION || !category) return null;
  const candidates = (Array.isArray(item.candidates) ? item.candidates : []).map(cleanCandidate).filter((c): c is FinderCandidate => c !== null).slice(0, MAX_CANDIDATES);
  const step = typeof item.step === 'number' && Number.isInteger(item.step) ? Math.max(0, Math.min(item.step, CATEGORY_PARAMETERS[category].length)) : 0;
  const keys = new Set(candidates.map(candidateKey));
  const tables = Object.fromEntries(Object.entries(tablesOf(item.tables)).filter(([key]) => keys.has(key)));
  return { version: PROGRESS_VERSION, category, answers: sanitizeAnswers(category, item.answers), step, candidates, tables, updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt.slice(0, 30) : '' };
}

/** The browser storage can be missing or blocked: reading then gives nothing and writing is silently skipped. */
export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): FinderProgress | null {
  try {
    const text = storage?.getItem(PROGRESS_KEY);
    return text ? parseProgress(JSON.parse(text)) : null;
  } catch {
    return null;
  }
}

export function saveProgress(progress: FinderProgress, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): void {
  try {
    storage?.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* A full or blocked storage only means that the progress is not kept. */
  }
}

export function clearProgress(storage: Pick<Storage, 'removeItem'> | undefined = safeStorage()): void {
  try {
    storage?.removeItem(PROGRESS_KEY);
  } catch {
    /* Nothing to do. */
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
