interface ServiceError {
  code?: string;
}

/** The part of the Supabase client that the erase uses: the table `intervals_connections` (a small fake is enough in tests). */
export interface LinkTable {
  from: (table: 'intervals_connections') => { delete: () => { eq: (column: 'user_id', value: string) => PromiseLike<{ error: ServiceError | null }> } };
}

/** The table is not there yet (the migration was not run): there is nothing to delete. */
const MISSING_TABLE = ['42P01', 'PGRST205'];

/** Deletes every stored Intervals.icu key of the rider (the rider erased the stored data); row level security allows only the own rows. */
export async function deleteMyConnections(db: LinkTable, userId: string): Promise<boolean> {
  try {
    const { error } = await db.from('intervals_connections').delete().eq('user_id', userId);
    return !error || MISSING_TABLE.includes(error.code ?? '');
  } catch {
    return false;
  }
}
