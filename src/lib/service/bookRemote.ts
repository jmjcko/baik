import type { BikeBook } from '@/types/service';
import { forAccount, type RemoteBook } from './bookSync';
import { parseBook } from './parseBook';

interface ServiceError {
  code?: string;
  message?: string;
}

interface BookRow {
  user_id: string;
  bike_id: string;
  updated_at: string;
  data: BikeBook;
}

/** The part of the Supabase client the books use: the table `bike_books` (a small fake is enough in tests). */
export interface BookDatabase {
  from: (table: 'bike_books') => {
    select: (columns: '*') => { eq: (column: 'user_id', value: string) => PromiseLike<{ data: unknown; error: ServiceError | null }> };
    upsert: (row: BookRow, options: { onConflict: 'user_id,bike_id' }) => PromiseLike<{ error: ServiceError | null }>;
    delete: () => { eq: (column: 'user_id', value: string) => PromiseLike<{ error: ServiceError | null }> };
  };
}

export type RemoteBooks = { status: 'ok'; books: RemoteBook[] } | { status: 'error' };

const asBook = (row: unknown): RemoteBook | null => {
  if (typeof row !== 'object' || row === null) return null;
  const { bike_id: bikeId, updated_at: updatedAt, data } = row as Record<string, unknown>;
  if (typeof bikeId !== 'string' || bikeId === '' || typeof updatedAt !== 'string' || Number.isNaN(Date.parse(updatedAt))) return null;
  return { bikeId, updatedAt, book: parseBook(data) };
};

/** The books of the signed in rider (row level security allows only the own rows); a row that cannot be read is left out, the book is parsed like a stored one. */
export async function fetchRemoteBooks(db: BookDatabase, userId: string): Promise<RemoteBooks> {
  try {
    const { data, error } = await db.from('bike_books').select('*').eq('user_id', userId);
    if (error || !Array.isArray(data)) return { status: 'error' };
    return { status: 'ok', books: data.map(asBook).filter((one): one is RemoteBook => one !== null) };
  } catch {
    return { status: 'error' };
  }
}

/** Creates or updates the book of one bike of the rider (without the frame number, the insurance number and the photo). */
export async function saveRemoteBook(db: BookDatabase, userId: string, bikeId: string, book: BikeBook, updatedAt: string): Promise<boolean> {
  try {
    const { error } = await db.from('bike_books').upsert({ user_id: userId, bike_id: bikeId, updated_at: updatedAt, data: forAccount(book) }, { onConflict: 'user_id,bike_id' });
    return !error;
  } catch {
    return false;
  }
}

/** The table is not there yet (the migration was not run): there is nothing to delete. */
const MISSING_TABLE = ['42P01', 'PGRST205'];

/** Deletes every book of the rider (the rider erased the stored data). */
export async function deleteRemoteBooks(db: BookDatabase, userId: string): Promise<boolean> {
  try {
    const { error } = await db.from('bike_books').delete().eq('user_id', userId);
    return !error || MISSING_TABLE.includes(error.code ?? '');
  } catch {
    return false;
  }
}
