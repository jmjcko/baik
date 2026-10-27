import { describe, it, expect, vi, afterEach } from 'vitest';
import { readGeometryTable, recommendBikes } from '../findBikes';
import { RECOMMEND_LIMIT, recommendLimiter } from '@/lib/finder/limits';
import { RIDER_TABLE_LIMIT, riderTableLimiter } from '@/lib/bikes/riderTables';

let callerAddress = '203.0.113.7';
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': callerAddress }) }));

const rider = { heightCm: 178, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 640, acromionWidthMm: 400, riderWeightKg: 75, ridingStyle: 'balanced', flexibilityScore: 'moderate', currentPains: [] };
const request = { category: 'road', locale: 'en', rider, answers: { shifting: ['electronic'] } };
const body = (text: string) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response;
const bikes = JSON.stringify({ bikes: [{ brand: 'Canyon', model: 'Endurace CF 8', year: 2025, reason: 'Comfortable.' }] });
const sizes = JSON.stringify({ sizes: [{ size: 'M', frameStackMm: 570, frameReachMm: 385, seatTubeAngleDeg: 73.5 }, { size: 'L', frameStackMm: 590, frameReachMm: 395, seatTubeAngleDeg: 73.5 }] });
const picture = { images: [{ imageBase64: 'A'.repeat(400), mimeType: 'image/jpeg' }], name: 'Canyon Endurace CF 8 2024' };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  recommendLimiter.reset();
  riderTableLimiter.reset();
  callerAddress = '203.0.113.7';
});

describe('recommendBikes (server action)', () => {
  it('should refuse an invalid request before anything is sent', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect(await recommendBikes({ ...request, category: 'ebike' })).toEqual({ success: false, error: 'invalid_input' });
    expect(await recommendBikes(undefined)).toEqual({ success: false, error: 'invalid_input' });
    expect(send).not.toHaveBeenCalled();
  });

  it('should say when no key is configured: there is no suggestion without the key of the owner', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await recommendBikes(request)).toEqual({ success: false, error: 'not_configured' });
  });

  it('should return the candidates, and fixed codes for failures', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => body(bikes)));
    expect(await recommendBikes(request)).toMatchObject({ success: true, candidates: [{ brand: 'Canyon', model: 'Endurace CF 8' }] });
    vi.stubGlobal('fetch', vi.fn(async () => body('nothing')));
    expect(await recommendBikes(request)).toEqual({ success: false, error: 'unreadable' });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await recommendBikes(request)).toEqual({ success: false, error: 'unavailable' });
  });

  it('should allow 6 calls per hour per caller, refuse the next one without calling Gemini and count each caller on its own', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn(async () => body(bikes));
    vi.stubGlobal('fetch', send);
    expect(RECOMMEND_LIMIT).toEqual({ max: 6, windowMs: 3_600_000 });
    for (let call = 0; call < 6; call++) expect((await recommendBikes(request)).success).toBe(true);
    expect(await recommendBikes(request)).toEqual({ success: false, error: 'rate_limited' });
    expect(send).toHaveBeenCalledTimes(6);
    callerAddress = '198.51.100.9';
    expect((await recommendBikes(request)).success).toBe(true);
  });

  it('should not count a call to an unavailable service', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    for (let call = 0; call < 10; call++) await recommendBikes(request);
    vi.stubGlobal('fetch', vi.fn(async () => body(bikes)));
    expect((await recommendBikes(request)).success).toBe(true);
  });
});

describe('readGeometryTable (server action)', () => {
  it('should refuse a bad input before anything is sent: no picture, a bad picture, too many pictures, a name with markup, a PDF', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    const image = picture.images[0];
    const bad = [
      undefined,
      { ...picture, images: [] },
      { ...picture, images: [{ imageBase64: 'x', mimeType: 'image/jpeg' }] },
      { ...picture, images: [image, image, image, image, image] },
      { ...picture, images: [{ ...image, mimeType: 'application/pdf' }] },
      { ...picture, name: '<script>alert(1)</script>' },
      { ...picture, name: '' },
    ];
    for (const input of bad) expect(await readGeometryTable(input)).toEqual({ success: false, error: 'invalid_input' });
    expect(send).not.toHaveBeenCalled();
  });

  it('should say when there is no key and return every size that Gemini read, as the owner page does', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await readGeometryTable(picture)).toEqual({ success: false, error: 'not_configured' });
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => body(sizes)));
    const result = await readGeometryTable(picture);
    expect(result.success).toBe(true);
    expect(result.table?.sizes.map((row) => row.size)).toEqual(['M', 'L']);
    vi.stubGlobal('fetch', vi.fn(async () => body('no table here')));
    expect(await readGeometryTable(picture)).toEqual({ success: false, error: 'unreadable' });
  });

  it('should send up to four pictures and the bike name, with no tool and no key in the body', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'secret-key');
    const send = vi.fn(async () => body(sizes));
    vi.stubGlobal('fetch', send);
    await readGeometryTable({ ...picture, images: [picture.images[0], picture.images[0]] });
    const [, init] = send.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(init.body as string);
    expect(payload.tools).toBeUndefined();
    expect(payload.contents[0].parts).toHaveLength(3);
    expect(payload.contents[0].parts[0].text).toContain('Canyon Endurace CF 8 2024');
    expect(init.body as string).not.toContain('secret-key');
  });

  it('should allow 12 readings per hour per caller, refuse the next one and give back a call to an unavailable service', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const send = vi.fn(async () => body(sizes));
    vi.stubGlobal('fetch', send);
    expect(RIDER_TABLE_LIMIT.max).toBe(12);
    for (let call = 0; call < 12; call++) expect((await readGeometryTable(picture)).success).toBe(true);
    expect(await readGeometryTable(picture)).toEqual({ success: false, error: 'rate_limited' });
    expect(send).toHaveBeenCalledTimes(12);
    riderTableLimiter.reset();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    for (let call = 0; call < 20; call++) await readGeometryTable(picture);
    vi.stubGlobal('fetch', vi.fn(async () => body(sizes)));
    expect((await readGeometryTable(picture)).success).toBe(true);
  });
});
