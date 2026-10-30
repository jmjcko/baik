import { describe, it, expect, vi, afterEach } from 'vitest';
import { researchGearParameters } from '../researchGearParameters';
import { RESEARCH_LIMIT, researchLimiter } from '@/lib/gear/limits';

let callerAddress = '203.0.113.9';
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': callerAddress }) }));

const request = { query: 'bar tape', locale: 'en', discipline: 'road', known: ['Foot width'] };
const body = (text: string) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response;
const answer = JSON.stringify({ productTitle: 'Bar tape', category: 'barTape', parameters: [{ name: 'Thickness', rationale: 'Comfort.', suggestedValues: ['2 mm', '3 mm'] }, { name: 'Material', rationale: 'Grip.', suggestedValues: [] }, { name: 'Brands', rationale: 'Trust.', suggestedValues: [] }] });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  researchLimiter.reset();
  callerAddress = '203.0.113.9';
});

describe('researchGearParameters (server action)', () => {
  it('should refuse an invalid request, and a motor bike, before anything is sent', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(await researchGearParameters({ ...request, query: '<b>x</b>' })).toEqual({ success: false, error: 'invalid_input' });
    expect(await researchGearParameters(undefined)).toEqual({ success: false, error: 'invalid_input' });
    expect(await researchGearParameters({ ...request, query: 'e-bike battery' })).toEqual({ success: false, error: 'out_of_scope' });
    expect(send).not.toHaveBeenCalled();
  });

  it('should say when no key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await researchGearParameters(request)).toEqual({ success: false, error: 'not_configured' });
  });

  it('should return the parameters, and fixed codes for failures', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => body(answer)));
    expect(await researchGearParameters(request)).toMatchObject({ success: true, result: { productTitle: 'Bar tape', category: 'barTape' } });
    vi.stubGlobal('fetch', vi.fn(async () => body('nothing')));
    expect(await researchGearParameters(request)).toEqual({ success: false, error: 'unreadable' });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await researchGearParameters(request)).toEqual({ success: false, error: 'unavailable' });
  });

  it('should allow 20 calls per hour per caller, refuse the next without calling Gemini, count each caller on its own, and not count an unavailable service', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn(async () => body(answer));
    vi.stubGlobal('fetch', send);
    for (let i = 0; i < RESEARCH_LIMIT.max; i += 1) expect((await researchGearParameters(request)).success).toBe(true);
    expect(await researchGearParameters(request)).toEqual({ success: false, error: 'rate_limited' });
    expect(send).toHaveBeenCalledTimes(RESEARCH_LIMIT.max);
    callerAddress = '203.0.113.10';
    expect((await researchGearParameters(request)).success).toBe(true);
    callerAddress = '203.0.113.11';
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    for (let i = 0; i < RESEARCH_LIMIT.max + 2; i += 1) expect(await researchGearParameters(request)).toEqual({ success: false, error: 'unavailable' });
  });
});
