import { passportToRow, rowToPassport } from './mappers';
import type { RiderPassport, RiderProfileRow } from './types';

interface ServiceError {
  code?: string;
  message?: string;
}

/** The part of the Supabase client that the passport uses: the table `rider_profiles` (a small fake is enough in tests). */
export interface PassportDatabase {
  from: (table: 'rider_profiles') => {
    select: (columns: '*') => { eq: (column: 'id', value: string) => { maybeSingle: () => PromiseLike<{ data: unknown; error: ServiceError | null }> } };
    upsert: (row: RiderProfileRow, options: { onConflict: 'id' }) => PromiseLike<{ error: ServiceError | null }>;
  };
}

export type RemotePassport = { status: 'ok'; passport: RiderPassport | null } | { status: 'invalid' } | { status: 'error' };

/** The passport of the signed in rider: none yet, the passport, or a row that cannot be used (never overwritten blindly). */
export async function fetchRemotePassport(db: PassportDatabase, userId: string): Promise<RemotePassport> {
  try {
    const { data, error } = await db.from('rider_profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return { status: 'error' };
    if (data === null) return { status: 'ok', passport: null };
    const passport = rowToPassport(data);
    return passport ? { status: 'ok', passport } : { status: 'invalid' };
  } catch {
    return { status: 'error' };
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
