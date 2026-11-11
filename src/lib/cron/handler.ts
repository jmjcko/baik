import { NextResponse } from 'next/server';
import { createAdminClient } from './adminClient';
import { isCronRequest } from './auth';
import type { CronConfig } from './config';
import { runRides, type RunDeps, type RunReport } from './runRides';

/** What a run may take: the host cuts a function short, so the run stops asking for new riders well before. */
const BUDGET_MS = 8000;
/** One call to Intervals.icu may take this long: a service that never answers must cost one rider, not the whole run. */
const FETCH_TIMEOUT_MS = 10_000;

/** `fetch` that gives up after the given time (the answer is then a failure of that rider). */
export const timedFetch = (timeoutMs: number) => (url: string, init?: RequestInit): Promise<Response> => fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });

type Runner = (deps: RunDeps) => Promise<RunReport>;

/** The daily call of the host: refused without the secret (401) or without the settings (503), otherwise the counts of the run. */
export async function cronRides(request: Request, config: CronConfig | null, run: Runner = runRides): Promise<Response> {
  if (!config) return NextResponse.json({ success: false, error: 'not_configured' }, { status: 503 });
  if (!isCronRequest(request, config.secret)) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
  const report = await run({ db: createAdminClient(config), config: config.intervals, fetcher: timedFetch(FETCH_TIMEOUT_MS), now: () => Date.now(), budgetMs: BUDGET_MS });
  console.info('cron rides', JSON.stringify(report));
  return NextResponse.json({ success: true, ...report });
}
