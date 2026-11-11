// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isCronRequest } from '../auth';
import { readCronConfig } from '../config';
import { cronRides, timedFetch } from '../handler';

const KEY = Buffer.alloc(32, 3).toString('base64');
const SECRET = 'a-long-random-secret-0123456789-abcdef';
const env = { CRON_SECRET: SECRET, SUPABASE_SERVICE_ROLE_KEY: 'service-key-value', NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_x', INTERVALS_TOKEN_KEY: KEY };
const call = (authorization?: string) => new Request('http://localhost/api/cron/rides', { headers: authorization ? { authorization } : {} });
const report = { riders: 0, booksUpdated: 0, skipped: 0, failed: 0, stoppedEarly: false, noConsent: { health_storage: 0, intervals: 0 } };

describe('the settings of the cron', () => {
  it('should be off when any of the secrets is missing or too weak', () => {
    expect(readCronConfig(env)).not.toBeNull();
    for (const name of ['CRON_SECRET', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'INTERVALS_TOKEN_KEY']) expect(readCronConfig({ ...env, [name]: undefined })).toBeNull();
    expect(readCronConfig({ ...env, CRON_SECRET: 'short' })).toBeNull();
    expect(readCronConfig({ ...env, CRON_SECRET: 'x'.repeat(31) })).toBeNull();
  });
});

describe('the call of the host', () => {
  it('should accept only the exact bearer secret', () => {
    expect(isCronRequest(call(`Bearer ${SECRET}`), SECRET)).toBe(true);
    for (const wrong of [undefined, SECRET, `Bearer ${SECRET}x`, 'Bearer wrong-secret-0000000', `bearer ${SECRET}`]) expect(isCronRequest(call(wrong), SECRET)).toBe(false);
  });

  it('should answer 503 without settings and 401 without the secret, and run nothing in both cases', async () => {
    let runs = 0;
    const run = async () => (runs += 1, report);
    expect((await cronRides(call(`Bearer ${SECRET}`), null, run)).status).toBe(503);
    expect((await cronRides(call('Bearer nope'), readCronConfig(env), run)).status).toBe(401);
    expect(runs).toBe(0);
  });

  it('should run with the right secret and answer with counts only', async () => {
    const response = await cronRides(call(`Bearer ${SECRET}`), readCronConfig(env), async () => ({ ...report, riders: 3, booksUpdated: 2 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, ...report, riders: 3, booksUpdated: 2 });
  });
});

describe('the call to Intervals.icu', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should give up on a service that never answers, so that one rider cannot hold the whole run', async () => {
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))));
    await expect(timedFetch(20)('https://intervals.icu/x')).rejects.toThrow();
  });

  it('should pass the answer of a service that is quick and keep the options of the call', async () => {
    const stub = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', stub);
    const response = await timedFetch(5000)('https://intervals.icu/x', { headers: { Accept: 'application/json' } });
    expect(await response.text()).toBe('ok');
    expect(stub).toHaveBeenCalledWith('https://intervals.icu/x', expect.objectContaining({ headers: { Accept: 'application/json' }, signal: expect.any(AbortSignal) }));
  });
});

const sources = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? sources(path) : /\.(ts|tsx)$/.test(name) && !/__tests__|\.test\./.test(path) ? [path] : [];
});

describe('the service role key', () => {
  const files = sources(join(process.cwd(), 'src'));
  const read = (path: string) => readFileSync(path, 'utf8');

  it('should be named in the settings file of the cron and nowhere else in the code', () => {
    const named = files.filter((path) => read(path).includes('SERVICE_ROLE'));
    expect(named.map((path) => path.replace(process.cwd() + '/', ''))).toEqual(['src/lib/cron/config.ts']);
  });

  it('should never be reachable from a file of the browser', () => {
    const browser = files.filter((path) => /^\s*['"]use client['"]/.test(read(path)));
    expect(browser.filter((path) => /lib\/cron\//.test(read(path)))).toEqual([]);
  });

  it('should be asked for by the schedule file with the right path, once a day', () => {
    const { crons } = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as { crons: Array<{ path: string; schedule: string }> };
    expect(crons).toEqual([{ path: '/api/cron/rides', schedule: '0 5 * * *' }]);
  });
});
