/** The server settings of the Strava integration (Epic 51, story 51.3). They come from the environment of the server, never from the browser or the repository. */
export interface StravaConfig {
  clientId: string;
  clientSecret: string;
  /** 32 bytes: the key that encrypts the tokens before they are stored (AES-256-GCM). */
  tokenKey: Buffer;
}

type Env = Record<string, string | undefined>;

/** The settings, or null when one is missing or the key is not 32 bytes of base64 (the integration is then off, nothing breaks). */
export function readStravaConfig(env: Env = process.env): StravaConfig | null {
  const clientId = env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = env.STRAVA_CLIENT_SECRET?.trim();
  const key = env.STRAVA_TOKEN_KEY?.trim();
  if (!clientId || !clientSecret || !key) return null;
  const tokenKey = Buffer.from(key, 'base64');
  return /^\d{1,12}$/.test(clientId) && tokenKey.length === 32 ? { clientId, clientSecret, tokenKey } : null;
}
