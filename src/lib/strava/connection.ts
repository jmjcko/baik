import type { SupabaseClient } from '@supabase/supabase-js';
import type { StravaConfig } from './config';
import { decryptToken, encryptToken } from './crypto';
import { refreshTokens, type Fetcher, type StravaTokens } from './oauth';

const TABLE = 'strava_connections';
/** A token that expires within this many seconds is renewed before it is used. */
const RENEW_SECONDS = 60;

const toIso = (epochSeconds: number): string => new Date(epochSeconds * 1000).toISOString();

/** Stores the tokens of the rider encrypted; the row belongs to the rider (row level security), the key to the server. */
export async function saveConnection(client: SupabaseClient, userId: string, tokens: StravaTokens, scope: string, config: StravaConfig): Promise<boolean> {
  if (tokens.athleteId === null) return false;
  const { error } = await client.from(TABLE).upsert({
    user_id: userId,
    athlete_id: tokens.athleteId,
    access_token_enc: encryptToken(tokens.accessToken, config.tokenKey),
    refresh_token_enc: encryptToken(tokens.refreshToken, config.tokenKey),
    expires_at: toIso(tokens.expiresAt),
    scope: scope.slice(0, 200),
    connected_at: new Date().toISOString(),
    last_sync_at: null,
  }, { onConflict: 'user_id' });
  return !error;
}

export type Access = { status: 'ok'; accessToken: string } | { status: 'none' } | { status: 'failed' };

/** A valid access token of the rider: read, decrypted and, when it is about to expire, renewed with the refresh token and stored again. */
export async function loadAccess(client: SupabaseClient, userId: string, config: StravaConfig, fetcher: Fetcher, now: number = Date.now()): Promise<Access> {
  const { data, error } = await client.from(TABLE).select('access_token_enc, refresh_token_enc, expires_at').eq('user_id', userId).maybeSingle();
  if (error) return { status: 'failed' };
  if (!data) return { status: 'none' };
  const access = decryptToken(String(data.access_token_enc), config.tokenKey);
  const refresh = decryptToken(String(data.refresh_token_enc), config.tokenKey);
  if (!access || !refresh) return { status: 'failed' };
  if (Date.parse(String(data.expires_at)) / 1000 - now / 1000 > RENEW_SECONDS) return { status: 'ok', accessToken: access };
  const renewed = await refreshTokens(config, refresh, fetcher);
  if (!renewed) return { status: 'failed' };
  const { error: saveError } = await client.from(TABLE).update({
    access_token_enc: encryptToken(renewed.accessToken, config.tokenKey),
    refresh_token_enc: encryptToken(renewed.refreshToken, config.tokenKey),
    expires_at: toIso(renewed.expiresAt),
  }).eq('user_id', userId);
  return saveError ? { status: 'failed' } : { status: 'ok', accessToken: renewed.accessToken };
}

export async function markSynced(client: SupabaseClient, userId: string): Promise<void> {
  await client.from(TABLE).update({ last_sync_at: new Date().toISOString() }).eq('user_id', userId);
}

export async function deleteConnection(client: SupabaseClient, userId: string): Promise<boolean> {
  const { error } = await client.from(TABLE).delete().eq('user_id', userId);
  return !error;
}
