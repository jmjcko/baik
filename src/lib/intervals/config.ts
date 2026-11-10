/** The server settings of the Intervals.icu connection (Epic 56, story 56.1): they come from the environment of the server, never from the browser or the repository. */
export interface IntervalsConfig {
  /** 32 bytes: the key that encrypts the key of the rider before it is stored (AES-256-GCM). */
  tokenKey: Buffer;
}

type Env = Record<string, string | undefined>;

/** The settings, or null when the variable is missing or is not 32 bytes of base64 (the server connection is then off, the browser mode still works). */
export function readIntervalsConfig(env: Env = process.env): IntervalsConfig | null {
  const key = env.INTERVALS_TOKEN_KEY?.trim();
  if (!key) return null;
  const tokenKey = Buffer.from(key, 'base64');
  return tokenKey.length === 32 ? { tokenKey } : null;
}
