import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptToken, encryptToken } from '@/lib/strava/crypto';
import type { IntervalsCreds } from './api';
import type { IntervalsConfig } from './config';

const TABLE = 'intervals_connections';

/** Stores the key of the rider encrypted; the row belongs to the rider (row level security), the key of the encryption to the server. */
export async function saveConnection(client: SupabaseClient, userId: string, riderId: string, creds: IntervalsCreds, config: IntervalsConfig): Promise<boolean> {
  const { error } = await client.from(TABLE).upsert({
    user_id: userId,
    rider_id: riderId,
    athlete_id: creds.athleteId,
    key_enc: encryptToken(creds.key, config.tokenKey),
    connected_at: new Date().toISOString(),
    last_sync_at: null,
  }, { onConflict: 'user_id,rider_id' });
  return !error;
}

export type Stored = { status: 'ok'; creds: IntervalsCreds } | { status: 'none' } | { status: 'failed' };

/** The key of the rider, read and decrypted; `failed` for a read that failed or a value that this server key cannot open. */
export async function loadCreds(client: SupabaseClient, userId: string, riderId: string, config: IntervalsConfig): Promise<Stored> {
  const { data, error } = await client.from(TABLE).select('athlete_id, key_enc').eq('user_id', userId).eq('rider_id', riderId).maybeSingle();
  if (error) return { status: 'failed' };
  if (!data) return { status: 'none' };
  const key = decryptToken(String(data.key_enc), config.tokenKey);
  return key ? { status: 'ok', creds: { athleteId: String(data.athlete_id), key } } : { status: 'failed' };
}

export async function markSynced(client: SupabaseClient, userId: string, riderId: string): Promise<void> {
  await client.from(TABLE).update({ last_sync_at: new Date().toISOString() }).eq('user_id', userId).eq('rider_id', riderId);
}

export async function deleteConnection(client: SupabaseClient, userId: string, riderId: string): Promise<boolean> {
  const { error } = await client.from(TABLE).delete().eq('user_id', userId).eq('rider_id', riderId);
  return !error;
}
