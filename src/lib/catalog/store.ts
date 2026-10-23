import { parseSizeSpec } from '@/lib/bikes/parseSizeSpec';
import type { SizeSpec } from '@/lib/bikes/types';
import type { BikeShare, CatalogOrigin, CatalogRow, SubmissionRow, SubmissionStatus } from './types';

interface ServiceError {
  code?: string;
  message?: string;
}

type Answer<T = unknown> = PromiseLike<{ data: T; error: ServiceError | null }>;

/** The part of the Supabase client that the catalog uses (a small fake is enough in tests). */
export interface CatalogDatabase {
  from: (table: 'bike_catalog' | 'bike_submissions') => {
    select: (columns: '*') => Answer<unknown> & { eq: (column: 'status', value: SubmissionStatus) => Answer<unknown> };
    upsert: (row: Record<string, unknown>, options: { onConflict: 'user_id,key' }) => PromiseLike<{ error: ServiceError | null }>;
    delete: () => { eq: (column: 'user_id', value: string) => PromiseLike<{ error: ServiceError | null }> };
  };
  rpc: (fn: string, args?: Record<string, unknown>) => Answer<unknown>;
}

/** The table or the function is not there yet (the migration has not been run): the feature is simply off, nothing breaks. */
const MISSING = new Set(['42P01', '42883', 'PGRST205', 'PGRST202']);
const isMissing = (error: ServiceError | null): boolean => error?.code !== undefined && MISSING.has(error.code);

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number): string | null => (typeof value === 'string' && value.length > 0 && value.length <= max ? value : null);
const integer = (value: unknown): number | null => (typeof value === 'number' && Number.isInteger(value) ? value : null);

function commonOf(raw: Record<string, unknown>): (BikeShare & { key: string }) | null {
  const brand = text(raw.brand, 60);
  const model = text(raw.model, 60);
  const size = text(raw.size, 12);
  const year = integer(raw.year);
  const spec = parseSizeSpec(raw.spec);
  const key = text(raw.key, 200);
  return brand && model && size && year !== null && spec && key ? { brand, model, year, size, spec, key } : null;
}

export function parseCatalogRow(raw: unknown): CatalogRow | null {
  if (!isObject(raw)) return null;
  const common = commonOf(raw);
  const id = text(raw.id, 64);
  const origin: CatalogOrigin | null = raw.origin === 'owner' || raw.origin === 'community' ? raw.origin : null;
  const confirmations = integer(raw.confirmations);
  if (!common || !id || !origin || confirmations === null || confirmations < 0) return null;
  return { id, ...common, origin, confirmations, note: typeof raw.note === 'string' ? raw.note.slice(0, 300) : null };
}

export function parseSubmissionRow(raw: unknown): SubmissionRow | null {
  if (!isObject(raw)) return null;
  const common = commonOf(raw);
  const id = text(raw.id, 64);
  const status = raw.status === 'pending' || raw.status === 'approved' || raw.status === 'rejected' ? raw.status : null;
  if (!common || !id || !status) return null;
  return {
    id, ...common, status,
    userId: typeof raw.user_id === 'string' ? raw.user_id : null,
    catalogId: typeof raw.catalog_id === 'string' ? raw.catalog_id : null,
    reviewNote: typeof raw.review_note === 'string' ? raw.review_note : null,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : '',
  };
}

function rowsOf<T>(data: unknown, parse: (raw: unknown) => T | null): T[] {
  return Array.isArray(data) ? data.map(parse).filter((row): row is T => row !== null) : [];
}

/** The approved bikes (public), or null when they cannot be read (the admin page says so). */
export async function readCatalog(db: CatalogDatabase): Promise<CatalogRow[] | null> {
  try {
    const { data, error } = await db.from('bike_catalog').select('*');
    return error ? null : rowsOf(data, parseCatalogRow);
  } catch {
    return null;
  }
}

/** The approved bikes for the lists; an unreadable answer or a missing table is an empty catalog. */
export async function fetchCatalog(db: CatalogDatabase): Promise<CatalogRow[]> {
  return (await readCatalog(db)) ?? [];
}

/** What the signed in rider shares: the numbers, one row per bike size (shared again, it replaces the earlier one while it waits). */
export async function submitBike(db: CatalogDatabase, userId: string, bike: BikeShare): Promise<boolean> {
  try {
    const { error } = await db.from('bike_submissions').upsert(
      { user_id: userId, brand: bike.brand, model: bike.model, year: bike.year, size: bike.size, spec: bike.spec },
      { onConflict: 'user_id,key' }
    );
    return !error;
  } catch {
    return false;
  }
}

/** Removes the rider's own submissions; a missing table counts as nothing to remove. */
export async function deleteMySubmissions(db: CatalogDatabase, userId: string): Promise<boolean> {
  try {
    const { error } = await db.from('bike_submissions').delete().eq('user_id', userId);
    return !error || isMissing(error);
  } catch {
    return false;
  }
}

/** The rider's own submissions (for the export); a missing table is none. */
export async function fetchMySubmissions(db: CatalogDatabase): Promise<SubmissionRow[]> {
  try {
    const { data, error } = await db.from('bike_submissions').select('*');
    return error ? [] : rowsOf(data, parseSubmissionRow);
  } catch {
    return [];
  }
}

/** Whether the signed in user may moderate; any failure is "no". */
export async function fetchIsAdmin(db: CatalogDatabase): Promise<boolean> {
  try {
    const { data, error } = await db.rpc('is_admin');
    return !error && data === true;
  } catch {
    return false;
  }
}

/** The submissions that wait for the owner (the database lets only an admin see other riders' rows), or null when they cannot be read. */
export async function fetchPending(db: CatalogDatabase): Promise<SubmissionRow[] | null> {
  try {
    const { data, error } = await db.from('bike_submissions').select('*').eq('status', 'pending');
    return error ? null : rowsOf(data, parseSubmissionRow);
  } catch {
    return null;
  }
}

async function call(db: CatalogDatabase, fn: string, args: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await db.rpc(fn, args);
    return !error;
  } catch {
    return false;
  }
}

export interface ApprovalInput {
  submissionId: string;
  brand: string;
  model: string;
  year: number;
  size: string;
  spec: SizeSpec;
  note: string | null;
}

export const approveSubmission = (db: CatalogDatabase, a: ApprovalInput) =>
  call(db, 'approve_submission', { p_submission: a.submissionId, p_brand: a.brand, p_model: a.model, p_year: a.year, p_size: a.size, p_spec: a.spec, p_note: a.note });

export const mergeSubmission = (db: CatalogDatabase, submissionId: string, catalogId: string) =>
  call(db, 'merge_submission', { p_submission: submissionId, p_catalog: catalogId });

export const rejectSubmission = (db: CatalogDatabase, submissionId: string, note: string | null) =>
  call(db, 'reject_submission', { p_submission: submissionId, p_note: note });

export const saveOwnerBike = (db: CatalogDatabase, bike: BikeShare, note: string | null) =>
  call(db, 'admin_save_bike', { p_brand: bike.brand, p_model: bike.model, p_year: bike.year, p_size: bike.size, p_spec: bike.spec, p_note: note });

export const deleteCatalogBike = (db: CatalogDatabase, catalogId: string) => call(db, 'admin_delete_catalog_bike', { p_catalog: catalogId });
