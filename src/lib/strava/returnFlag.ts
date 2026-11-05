export const STRAVA_RETURNS = ['connected', 'denied', 'scope', 'error', 'not_configured', 'signin'] as const;
export type StravaReturn = (typeof STRAVA_RETURNS)[number];

let pending: StravaReturn | null = null;

/** Reads `?strava=<result>` that the callback route adds when it sends the rider back; true when it was there (the page then opens bAIkcare). */
export function captureStravaReturn(search: string): boolean {
  const value = new URLSearchParams(search).get('strava');
  pending = STRAVA_RETURNS.find((candidate) => candidate === value) ?? null;
  return pending !== null;
}

export const peekStravaReturn = (): StravaReturn | null => pending;
export const clearStravaReturn = (): void => {
  pending = null;
};
