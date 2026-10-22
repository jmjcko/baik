import { describe, it, expect, vi, afterEach } from 'vitest';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';
import { buildExtractionPrompt, parseExtraction, requestStockSpec, validateExtractionInput } from '../extraction';
import { extractStockBikeSpec } from '@/app/actions/extractStockBikeSpec';
import { EXTRACTION_LIMIT, extractionLimiter } from '../extractionLimit';

let callerAddress = '203.0.113.7';
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': callerAddress }) }));

const M = STOCK_BIKE_SPECS[0].sizes.M;
const reply = (over: Record<string, unknown> = {}) => ({
  brand: 'Canyon', model: 'Endurace CF 8', year: 2024, frameStackMm: 590, frameReachMm: 378, seatTubeAngleDeg: 73.5, topTubeMm: 543, headTubeMm: 164,
  stockStemMm: 100, stockHandlebarMm: 410, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null, ...over,
});
const body = (text: string) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response;
const URL_OK = 'https://www.canyon.com/en-us/road-bikes/endurace-cf-8';

describe('validateExtractionInput', () => {
  it('should accept a public https or http URL and a plain size', () => {
    expect(validateExtractionInput({ url: URL_OK, size: 'M' })).toBe(true);
    expect(validateExtractionInput({ url: 'http://example.com/bike', size: ' 54cm ' })).toBe(true);
    expect(validateExtractionInput({ url: URL_OK, size: 'M/L' })).toBe(true);
  });

  it.each([
    ['localhost', { url: 'http://localhost:3000/x', size: 'M' }],
    ['the cloud metadata address', { url: 'http://169.254.169.254/latest', size: 'M' }],
    ['a private address', { url: 'http://192.168.0.1/', size: 'M' }],
    ['a file URL', { url: 'file:///etc/passwd', size: 'M' }],
    ['credentials in the URL', { url: 'https://user:pw@example.com/', size: 'M' }],
    ['text that is not a URL', { url: 'canyon endurace', size: 'M' }],
    ['a very long URL', { url: `https://example.com/${'a'.repeat(2100)}`, size: 'M' }],
    ['an empty size', { url: URL_OK, size: ' ' }],
    ['a size with a quote and a tag', { url: URL_OK, size: '"><script>' }],
    ['a too long size', { url: URL_OK, size: 'M'.repeat(13) }],
    ['no input', undefined as never],
  ])('should refuse %s', (_name, input) => {
    expect(validateExtractionInput(input)).toBe(false);
  });
});

describe('the prompt', () => {
  it('should name the page and the size and tell the model to use only the page and null for the rest', () => {
    expect(buildExtractionPrompt({ url: URL_OK, size: ' M ' })).toBe(`Page: ${URL_OK}\nFrame size: M\nExtract the geometry (stack, reach, seat tube angle) and the stock components of this frame size.`);
  });
});

describe('parseExtraction', () => {
  it('should read a plain JSON answer, also in a fence or in a sentence', () => {
    const json = JSON.stringify(reply());
    for (const text of [json, `\`\`\`json\n${json}\n\`\`\``, `Here is the data: ${json} Hope it helps.`]) {
      expect(parseExtraction(text, 'M')).toMatchObject({ source: 'ai', brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M', spec: { ...M, stockSeatpostOffsetMm: null } });
    }
  });

  it('should keep a component that the page does not state as null', () => {
    const parsed = parseExtraction(JSON.stringify(reply({ stockHandlebarMm: null, stockCrankMm: null })), 'M');
    expect(parsed?.spec).toMatchObject({ stockHandlebarMm: null, stockCrankMm: null });
  });

  it('should use the size that the rider asked for, not the one in the answer', () => {
    expect(parseExtraction(JSON.stringify(reply({ size: 'XXL' })), '54')?.size).toBe('54');
  });

  it.each([
    ['not JSON', 'sorry, I could not read the page'],
    ['broken JSON', '{"brand": "Canyon",'],
    ['a not found answer', '{"error": "not_found"}'],
    ['no geometry', JSON.stringify(reply({ frameStackMm: null }))],
    ['an implausible stack', JSON.stringify(reply({ frameStackMm: 59 }))],
    ['an implausible angle', JSON.stringify(reply({ seatTubeAngleDeg: 7.35 }))],
    ['text for a number', JSON.stringify(reply({ frameReachMm: 'long' }))],
    ['no brand', JSON.stringify(reply({ brand: '' }))],
    ['no year', JSON.stringify(reply({ year: null }))],
    ['an array', '[1, 2]'],
    ['an empty answer', ''],
  ])('should refuse %s', (_name, text) => {
    expect(parseExtraction(text, 'M')).toBeNull();
  });

  it('should replace an implausible stock component by null instead of refusing the bike', () => {
    expect(parseExtraction(JSON.stringify(reply({ stockCrankMm: 17.25 })), 'M')?.spec.stockCrankMm).toBeNull();
  });
});

describe('requestStockSpec', () => {
  it('should send the page with the URL context tool, the key in a header only, and read the bike', async () => {
    const fetchImpl = vi.fn(async () => body(JSON.stringify(reply())));
    const outcome = await requestStockSpec('secret-key', { url: URL_OK, size: 'M' }, fetchImpl as unknown as typeof fetch);
    expect(outcome).toMatchObject({ status: 'ok', bike: { brand: 'Canyon', size: 'M' } });
    const [endpoint, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(endpoint).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-key');
    const sent = JSON.parse(init.body as string);
    expect(sent.tools).toEqual([{ url_context: {} }]);
    expect(sent.generationConfig).toEqual({ temperature: 0 });
    expect(init.body as string).not.toContain('secret-key');
    expect(sent.contents[0].parts[0].text).toContain(URL_OK);
  });

  it('should join the parts of the answer', async () => {
    const half = JSON.stringify(reply());
    const split = { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: half.slice(0, 20) }, { text: half.slice(20) }, { other: 1 }] } }] }) } as unknown as Response;
    const outcome = await requestStockSpec('k', { url: URL_OK, size: 'M' }, (async () => split) as unknown as typeof fetch);
    expect(outcome.status).toBe('ok');
  });

  it.each([
    ['an answer without a candidate', { ok: true, json: async () => ({}) } as unknown as Response, 'unreadable'],
    ['an answer that is not a bike', body('no idea'), 'unreadable'],
    ['a service error', { ok: false, json: async () => ({}) } as unknown as Response, 'unavailable'],
  ])('should say %s', async (_name, response, status) => {
    expect(await requestStockSpec('k', { url: URL_OK, size: 'M' }, (async () => response) as unknown as typeof fetch)).toEqual({ status });
  });

  it('should say unavailable when the request fails or the body cannot be read', async () => {
    expect(await requestStockSpec('k', { url: URL_OK, size: 'M' }, (async () => { throw new Error('offline'); }) as unknown as typeof fetch)).toEqual({ status: 'unavailable' });
    const broken = { ok: true, json: async () => { throw new Error('bad body'); } } as unknown as Response;
    expect(await requestStockSpec('k', { url: URL_OK, size: 'M' }, (async () => broken) as unknown as typeof fetch)).toEqual({ status: 'unavailable' });
  });
});

describe('extractStockBikeSpec (server action)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    extractionLimiter.reset();
    callerAddress = '203.0.113.7';
  });

  it('should refuse a forbidden URL before anything is sent', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await extractStockBikeSpec({ url: 'http://127.0.0.1/admin', size: 'M' })).toEqual({ success: false, error: 'invalid_input' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should say when no key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(await extractStockBikeSpec({ url: URL_OK, size: 'M' })).toEqual({ success: false, error: 'not_configured' });
  });

  it('should return the bike that Gemini read, and fixed codes for failures', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => body(JSON.stringify(reply()))));
    expect(await extractStockBikeSpec({ url: URL_OK, size: 'M' })).toMatchObject({ success: true, bike: { brand: 'Canyon', model: 'Endurace CF 8' } });
    vi.stubGlobal('fetch', vi.fn(async () => body('nothing')));
    expect(await extractStockBikeSpec({ url: URL_OK, size: 'M' })).toEqual({ success: false, error: 'unreadable' });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await extractStockBikeSpec({ url: URL_OK, size: 'M' })).toEqual({ success: false, error: 'unavailable' });
  });

  it('should allow 8 calls per hour per caller and refuse the next one without calling Gemini', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    const fetchMock = vi.fn(async () => body(JSON.stringify(reply())));
    vi.stubGlobal('fetch', fetchMock);
    expect(EXTRACTION_LIMIT).toEqual({ max: 8, windowMs: 3_600_000 });
    for (let call = 0; call < 8; call++) expect((await extractStockBikeSpec({ url: URL_OK, size: 'M' })).success).toBe(true);
    expect(await extractStockBikeSpec({ url: URL_OK, size: 'M' })).toEqual({ success: false, error: 'rate_limited' });
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it('should count each caller on its own', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'k');
    vi.stubGlobal('fetch', vi.fn(async () => body(JSON.stringify(reply()))));
    for (let call = 0; call < 8; call++) await extractStockBikeSpec({ url: URL_OK, size: 'M' });
    callerAddress = '198.51.100.9';
    expect((await extractStockBikeSpec({ url: URL_OK, size: 'M' })).success).toBe(true);
  });

  it('should not count a call that fails the input check or finds no key', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => body(JSON.stringify(reply()))));
    vi.stubEnv('GEMINI_API_KEY', '');
    for (let call = 0; call < 12; call++) await extractStockBikeSpec({ url: URL_OK, size: 'M' });
    vi.stubEnv('GEMINI_API_KEY', 'k');
    for (let call = 0; call < 12; call++) await extractStockBikeSpec({ url: 'http://localhost/x', size: 'M' });
    expect((await extractStockBikeSpec({ url: URL_OK, size: 'M' })).success).toBe(true);
  });
});
