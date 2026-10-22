import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';
import { parseSizeSpec, SIZE_LIMITS } from '../parseSizeSpec';
import { parseStockSelection } from '../parseSelection';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const aiSelection = { source: 'ai', brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M', spec };

describe('parseSizeSpec', () => {
  it('should accept every size of the seed unchanged (the limits and the seed agree)', () => {
    for (const bike of STOCK_BIKE_SPECS) for (const size of bike.sizeOrder) expect(parseSizeSpec(bike.sizes[size]), `${bike.id} ${size}`).toEqual(bike.sizes[size]);
  });

  it.each([['frameStackMm'], ['frameReachMm'], ['seatTubeAngleDeg']] as const)('should refuse a size without a plausible %s', (key) => {
    expect(parseSizeSpec({ ...spec, [key]: undefined })).toBeNull();
    expect(parseSizeSpec({ ...spec, [key]: SIZE_LIMITS[key][0] - 1 })).toBeNull();
    expect(parseSizeSpec({ ...spec, [key]: SIZE_LIMITS[key][1] + 1 })).toBeNull();
    expect(parseSizeSpec({ ...spec, [key]: '590' })).toBeNull();
    expect(parseSizeSpec({ ...spec, [key]: NaN })).toBeNull();
  });

  it('should turn a missing or implausible stock component into null and never guess one', () => {
    const parsed = parseSizeSpec({ ...spec, stockStemMm: 900, stockHandlebarMm: undefined, stockCrankMm: 'long', stockSpacersMm: -4 });
    expect(parsed).toMatchObject({ stockStemMm: null, stockHandlebarMm: null, stockCrankMm: null, stockSpacersMm: null, stockSeatpostOffsetMm: null });
  });

  it('should drop an implausible optional number and keep a plausible one', () => {
    const parsed = parseSizeSpec({ ...spec, topTubeMm: 5, headTubeMm: 164 });
    expect(parsed?.topTubeMm).toBeUndefined();
    expect(parsed?.headTubeMm).toBe(164);
  });

  it('should drop fields it does not know', () => {
    expect(Object.keys(parseSizeSpec({ ...spec, evil: '<script>' })!)).not.toContain('evil');
  });

  it.each([[null], [undefined], ['text'], [42], [[]]])('should refuse %s', (raw) => {
    expect(parseSizeSpec(raw)).toBeNull();
  });
});

describe('parseStockSelection', () => {
  it('should accept a seed bike and an AI bike', () => {
    expect(parseStockSelection({ source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' })).toEqual({ source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' });
    expect(parseStockSelection(aiSelection)).toEqual(aiSelection);
  });

  it('should clean control characters out of text', () => {
    const parsed = parseStockSelection({ ...aiSelection, brand: ' Can\u0000yon\n ', model: 'Endurace\tCF 8' });
    expect(parsed).toMatchObject({ brand: 'Can yon', model: 'Endurace CF 8' });
  });

  it.each([
    ['a missing size', { source: 'seed', bikeId: 'x' }],
    ['an empty size', { source: 'seed', bikeId: 'x', size: ' ' }],
    ['a too long size', { source: 'seed', bikeId: 'x', size: 'x'.repeat(13) }],
    ['an unknown source', { source: 'url', bikeId: 'x', size: 'M' }],
    ['a seed bike without an id', { source: 'seed', size: 'M' }],
    ['an AI bike without a brand', { ...aiSelection, brand: '' }],
    ['an AI bike with a too long model', { ...aiSelection, model: 'm'.repeat(61) }],
    ['an AI bike with an implausible spec', { ...aiSelection, spec: { ...spec, frameStackMm: 5 } }],
    ['an AI bike with a year that is not a year', { ...aiSelection, year: 1850 }],
    ['an AI bike with a fractional year', { ...aiSelection, year: 2024.5 }],
    ['an array', []],
    ['null', null],
  ])('should drop %s', (_name, raw) => {
    expect(parseStockSelection(raw)).toBeNull();
  });
});
