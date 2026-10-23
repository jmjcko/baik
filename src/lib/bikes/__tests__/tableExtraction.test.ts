import { describe, it, expect, vi } from 'vitest';
import { parseBikeName } from '../parseBikeName';
import { buildTablePrompt, parseTable, requestBikeTable } from '../tableExtraction';

const size = (label: unknown, over: Record<string, unknown> = {}) => ({ size: label, frameStackMm: 525, frameReachMm: 365, seatTubeAngleDeg: 74.6, topTubeMm: 510, headTubeMm: 120, stockStemMm: 80, stockHandlebarMm: 380, stockCrankMm: 165, ...over });
const answerOf = (sizes: unknown[]) => JSON.stringify({ sizes });
const gemini = (text: string, ok = true, status = 200) => vi.fn(async () => ({ ok, status, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response);
const pause = async () => undefined;

describe('parseTable', () => {
  it('should read every size and drop the unit of the label', () => {
    const table = parseTable(answerOf([size('47 cm'), size('50', { frameStackMm: 538 }), size(53)]));
    expect(table?.sizes.map((item) => item.size)).toEqual(['47', '50', '53']);
    expect(table?.sizes[0].spec).toMatchObject({ frameStackMm: 525, frameReachMm: 365, seatTubeAngleDeg: 74.6, stockStemMm: 80, stockHandlebarMm: 380, stockCrankMm: 165 });
    expect(table?.skipped).toBe(0);
  });

  it('should keep an unstated part as null and never guess it', () => {
    const table = parseTable(answerOf([size('56', { stockCrankMm: null, stockHandlebarMm: undefined, stockSeatpostOffsetMm: 'n/a' })]));
    expect(table?.sizes[0].spec).toMatchObject({ stockCrankMm: null, stockHandlebarMm: null, stockSeatpostOffsetMm: null });
  });

  it('should count a size with unusable numbers, a bad label or a repeated size as skipped', () => {
    const table = parseTable(answerOf([size('47'), size('50', { frameStackMm: 5 }), size('<b>'), size('47'), size(null), null]));
    expect(table?.sizes.map((item) => item.size)).toEqual(['47']);
    expect(table?.skipped).toBe(5);
  });

  it('should read an answer wrapped in a fence, and refuse everything else', () => {
    expect(parseTable('```json\n' + answerOf([size('47')]) + '\n```')?.sizes).toHaveLength(1);
    for (const text of ['', 'no json', '{"error": "not_found"}', '{"sizes": []}', '{"sizes": "x"}', answerOf([size('50', { frameReachMm: 1 })])]) expect(parseTable(text)).toBeNull();
  });

  it('should read at most 20 sizes', () => {
    expect(parseTable(answerOf(Array.from({ length: 30 }, (_, index) => size(String(40 + index)))))?.sizes).toHaveLength(20);
  });
});

describe('requestBikeTable', () => {
  const files = [{ data: 'AAAA', mimeType: 'image/png' }, { data: 'BBBB', mimeType: 'application/pdf' }];

  it('should send all files and the name in one request and return the table', async () => {
    const fetchMock = gemini(answerOf([size('47'), size('50')]));
    const outcome = await requestBikeTable('key', { files, name: 'Cube Attain 2027' }, fetchMock, pause);
    expect(outcome).toMatchObject({ status: 'ok', table: { sizes: [{ size: '47' }, { size: '50' }] } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const sent = JSON.parse(init.body as string);
    expect(sent.contents[0].parts).toEqual([{ text: buildTablePrompt('Cube Attain 2027', 2) }, { inline_data: { mime_type: 'image/png', data: 'AAAA' } }, { inline_data: { mime_type: 'application/pdf', data: 'BBBB' } }]);
    expect(sent.tools).toBeUndefined();
    expect(sent.system_instruction.parts[0].text).toContain('never estimate');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('key');
    expect(init.body as string).not.toContain('"key"');
  });

  it('should say unreadable when no table is found and unavailable when the service fails, also after a busy service', async () => {
    expect(await requestBikeTable('k', { files, name: 'x' }, gemini('{"error":"not_found"}'), pause)).toEqual({ status: 'unreadable' });
    expect(await requestBikeTable('k', { files, name: 'x' }, gemini('', false, 400), pause)).toEqual({ status: 'unavailable' });
    const busy = vi.fn().mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) }).mockImplementation(gemini(answerOf([size('47')])));
    expect(await requestBikeTable('k', { files, name: 'x' }, busy as unknown as typeof fetch, pause)).toMatchObject({ status: 'ok' });
    expect(await requestBikeTable('k', { files, name: 'x' }, vi.fn(async () => { throw new Error('offline'); }), pause)).toEqual({ status: 'unavailable' });
  });
});

describe('parseBikeName', () => {
  it.each([
    ['Cube Attain 2027', { brand: 'Cube', model: 'Attain', year: '2027' }],
    ['2027 Cube Attain GTC Pro', { brand: 'Cube', model: 'Attain GTC Pro', year: '2027' }],
    ['  Canyon   Endurace  ', { brand: 'Canyon', model: 'Endurace', year: '' }],
    ['Trek', { brand: 'Trek', model: '', year: '' }],
    ['', { brand: '', model: '', year: '' }],
    ['Cube Model 3000 2026', { brand: 'Cube', model: 'Model 3000', year: '2026' }],
  ])('should split "%s"', (text, expected) => {
    expect(parseBikeName(text)).toEqual(expected);
  });
});
