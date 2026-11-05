import { randomBytes } from 'node:crypto';
import type { StravaConfig } from './config';

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** What the app asks for: the profile (for the bikes) and the rides. Private rides stay private (no `activity:read_all`). */
export const STRAVA_SCOPE = 'read,profile:read_all,activity:read';
export const STATE_COOKIE = 'baik_strava_state';
export const STRAVA_BASE = 'https://www.strava.com';

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch seconds. */
  expiresAt: number;
  athleteId: number | null;
}

export const newState = (): string => randomBytes(16).toString('hex');

/** The page of Strava where the rider agrees; Strava sends them back to `redirectUri` with a code and the state. */
export function authorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const query = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', approval_prompt: 'auto', scope: STRAVA_SCOPE, state });
  return `${STRAVA_BASE}/oauth/authorize?${query.toString()}`;
}

/** Whether the scope Strava reports (a comma list) includes reading the rides. */
export const grantsActivities = (scope: string | null): boolean => (scope ?? '').split(',').includes('activity:read');

export const isCode = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9]{8,128}$/.test(value);

export function parseTokens(raw: unknown): StravaTokens | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const json = raw as Record<string, unknown>;
  const athlete = json.athlete as { id?: unknown } | undefined;
  const { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt } = json;
  if (typeof accessToken !== 'string' || typeof refreshToken !== 'string' || typeof expiresAt !== 'number' || !accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, expiresAt, athleteId: typeof athlete?.id === 'number' ? athlete.id : null };
}

async function tokenRequest(config: StravaConfig, extra: Record<string, string>, fetcher: Fetcher): Promise<StravaTokens | null> {
  try {
    const response = await fetcher(`${STRAVA_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, ...extra }).toString(),
    });
    return response.ok ? parseTokens(await response.json()) : null;
  } catch {
    return null;
  }
}

export const exchangeCode = (config: StravaConfig, code: string, fetcher: Fetcher): Promise<StravaTokens | null> => tokenRequest(config, { code, grant_type: 'authorization_code' }, fetcher);

export const refreshTokens = (config: StravaConfig, refreshToken: string, fetcher: Fetcher): Promise<StravaTokens | null> => tokenRequest(config, { refresh_token: refreshToken, grant_type: 'refresh_token' }, fetcher);
