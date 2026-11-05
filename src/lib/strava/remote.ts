import { STRAVA_BASE, type Fetcher } from './oauth';

export type RemoteResult<T> = { ok: true; data: T } | { ok: false; reason: 'unauthorized' | 'rate_limited' | 'unavailable' };

const API = `${STRAVA_BASE}/api/v3`;
export const MAX_PAGES = 5;
const PER_PAGE = 200;

async function get(path: string, accessToken: string, fetcher: Fetcher): Promise<RemoteResult<unknown>> {
  try {
    const response = await fetcher(`${API}${path}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (response.status === 401) return { ok: false, reason: 'unauthorized' };
    if (response.status === 429) return { ok: false, reason: 'rate_limited' };
    return response.ok ? { ok: true, data: await response.json() } : { ok: false, reason: 'unavailable' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/** The athlete with the bikes (needs the scope `profile:read_all`). */
export const fetchAthlete = (accessToken: string, fetcher: Fetcher): Promise<RemoteResult<unknown>> => get('/athlete', accessToken, fetcher);

/** The activities after a day, page by page up to the limit (the rate limit of Strava is 100 requests in 15 minutes). */
export async function fetchActivities(accessToken: string, afterEpoch: number, fetcher: Fetcher): Promise<RemoteResult<unknown[]>> {
  const all: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await get(`/athlete/activities?after=${afterEpoch}&per_page=${PER_PAGE}&page=${page}`, accessToken, fetcher);
    if (!result.ok) return result;
    if (!Array.isArray(result.data)) return { ok: false, reason: 'unavailable' };
    all.push(...result.data);
    if (result.data.length < PER_PAGE) break;
  }
  return { ok: true, data: all };
}

/** Tells Strava that the app no longer has access (the rider disconnects); a failure does not block the disconnect. */
export async function deauthorize(accessToken: string, fetcher: Fetcher): Promise<void> {
  try {
    await fetcher(`${STRAVA_BASE}/oauth/deauthorize`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  } catch {
    /* the token is deleted here anyway */
  }
}
