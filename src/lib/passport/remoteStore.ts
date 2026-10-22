import { passportToRow, rowToPassport } from './mappers';
import type { RiderPassport, RiderProfileRow } from './types';

interface ServiceError {
  code?: string;
  message?: string;
}

/** The part of the Supabase client that the passport uses: the table `rider_profiles` and the account deletion function (a small fake is enough in tests). */
export interface PassportDatabase {
  from: (table: 'rider_profiles') => {
    select: (columns: '*') => { eq: (column: 'id', value: string) => { maybeSingle: () => PromiseLike<{ data: unknown; error: ServiceError | null }> } };
    upsert: (row: RiderProfileRow, options: { onConflict: 'id' }) => PromiseLike<{ error: ServiceError | null }>;
    delete: () => { eq: (column: 'id', value: string) => PromiseLike<{ error: ServiceError | null }> };
  };
  rpc: (fn: 'delete_my_account') => PromiseLike<{ error: ServiceError | null }>;
}

/** The stored row of the rider: the passport with the timestamps the database keeps. */
export interface RemoteRecord {
  passport: RiderPassport;
  createdAt: string | null;
  updatedAt: string | null;
}

export type RemotePassport = { status: 'ok'; passport: RiderPassport | null } | { status: 'invalid' } | { status: 'error' };

export type RemoteRecordResult = { status: 'ok'; record: RemoteRecord | null } | { status: 'invalid' } | { status: 'error' };

const asTimestamp = (value: unknown): string | null => (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null);

/** The stored row of the signed in rider with its timestamps: none yet, the record, or a row that cannot be used. */
export async function fetchRemoteRecord(db: PassportDatabase, userId: string): Promise<RemoteRecordResult> {
  try {
    const { data, error } = await db.from('rider_profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return { status: 'error' };
    if (data === null) return { status: 'ok', record: null };
    const passport = rowToPassport(data);
    if (!passport) return { status: 'invalid' };
    const row = data as Partial<RiderProfileRow>;
    return { status: 'ok', record: { passport, createdAt: asTimestamp(row.created_at), updatedAt: asTimestamp(row.updated_at) } };
  } catch {
    return { status: 'error' };
  }
}

/** The passport of the signed in rider: none yet, the passport, or a row that cannot be used (never overwritten blindly). */
export async function fetchRemotePassport(db: PassportDatabase, userId: string): Promise<RemotePassport> {
  const result = await fetchRemoteRecord(db, userId);
  return result.status === 'ok' ? { status: 'ok', passport: result.record?.passport ?? null } : result;
}

/** Deletes the stored passport of the rider (row level security allows only the own row). */
export async function deleteRemotePassport(db: PassportDatabase, userId: string): Promise<boolean> {
  try {
    const { error } = await db.from('rider_profiles').delete().eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

/** Deletes the account of the signed in rider and, by cascade, the passport (SQL function `delete_my_account`). */
export async function deleteMyAccount(db: PassportDatabase): Promise<boolean> {
  try {
    const { error } = await db.rpc('delete_my_account');
    return !error;
  } catch {
    return false;
  }
}

/** Creates or updates the row of the rider (row level security allows only the own row). */
export async function saveRemotePassport(db: PassportDatabase, userId: string, passport: RiderPassport): Promise<boolean> {
  try {
    const { error } = await db.from('rider_profiles').upsert(passportToRow(userId, passport), { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}
