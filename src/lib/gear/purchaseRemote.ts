import { parsePurchase, type SavedPurchase } from './savedPurchases';

interface ServiceError {
  code?: string;
  message?: string;
}

/** The part of the Supabase client the purchases use: the table `gear_purchases` (a small fake is enough in tests). */
export interface PurchaseDatabase {
  from: (table: 'gear_purchases') => {
    select: (columns: '*') => { eq: (column: 'user_id', value: string) => PromiseLike<{ data: unknown; error: ServiceError | null }> };
    upsert: (row: PurchaseRow, options: { onConflict: 'user_id,id' }) => PromiseLike<{ error: ServiceError | null }>;
    delete: () => { eq: (column: 'user_id', value: string) => { eq: (column: 'id', value: string) => PromiseLike<{ error: ServiceError | null }> } };
  };
}

export interface PurchaseRow {
  user_id: string;
  id: string;
  status: SavedPurchase['status'];
  updated_at: string;
  data: SavedPurchase;
}

export const purchaseToRow = (userId: string, purchase: SavedPurchase): PurchaseRow => ({ user_id: userId, id: purchase.id, status: purchase.status, updated_at: purchase.updatedAt, data: purchase });

export type RemotePurchases = { status: 'ok'; purchases: SavedPurchase[] } | { status: 'error' };

/** The purchases of the signed in rider (row level security allows only the own rows); a row that cannot be read is left out. */
export async function fetchRemotePurchases(db: PurchaseDatabase, userId: string): Promise<RemotePurchases> {
  try {
    const { data, error } = await db.from('gear_purchases').select('*').eq('user_id', userId);
    if (error || !Array.isArray(data)) return { status: 'error' };
    const purchases = data.map((row) => parsePurchase((row as { data?: unknown } | null)?.data)).filter((one): one is SavedPurchase => one !== null);
    return { status: 'ok', purchases };
  } catch {
    return { status: 'error' };
  }
}

/** Creates or updates one purchase of the rider. */
export async function saveRemotePurchase(db: PurchaseDatabase, userId: string, purchase: SavedPurchase): Promise<boolean> {
  try {
    const { error } = await db.from('gear_purchases').upsert(purchaseToRow(userId, purchase), { onConflict: 'user_id,id' });
    return !error;
  } catch {
    return false;
  }
}

/** Deletes one purchase of the rider. */
export async function deleteRemotePurchase(db: PurchaseDatabase, userId: string, id: string): Promise<boolean> {
  try {
    const { error } = await db.from('gear_purchases').delete().eq('user_id', userId).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
