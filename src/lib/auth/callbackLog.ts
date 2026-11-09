/** Where the sign in return stopped. Fixed words only, so a log line can never carry a token, an e-mail or the message of the service. */
export type CallbackStage = 'no_config' | 'provider_error' | 'no_code' | 'exchange_failed' | 'verify_failed' | 'exception';

interface ServiceError {
  code?: unknown;
  status?: unknown;
  name?: unknown;
}

const SAFE = /^[a-z0-9_]{1,64}$/i;
const safe = (value: unknown): string | undefined => (typeof value === 'string' && SAFE.test(value) ? value : typeof value === 'number' ? String(value) : undefined);

/**
 * Writes one line to the server log (Vercel Logs) with the stage and, when the service gave them, its error code, status and name.
 * The rider still sees only the fixed error flag; this line is for the owner who has to find out why a sign in did not work.
 */
export function logCallbackFailure(stage: CallbackStage, error?: ServiceError | null, providerCode?: string | null): void {
  const line = { stage, code: safe(error?.code) ?? safe(providerCode), status: safe(error?.status), name: safe(error?.name) };
  console.error('[auth/callback]', JSON.stringify(line));
}
