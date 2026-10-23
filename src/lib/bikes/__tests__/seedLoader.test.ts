import { describe, it, expect } from 'vitest';
import { loadSeedBikes, SEED_CATEGORIES } from '../seedLoader';

const row = (size: string, stack: number, reach: number | string, over: Record<string, unknown> = {}) => ({
  size, stack_mm: stack, reach_mm: reach, seat_tube_angle_deg: 73.5, top_tube_mm: 540, head_tube_mm: 150, stock_stem_length_mm: 100,
  stock_bar_width_mm: 420, stock_crank_length_mm: 172.5, stock_seatpost_offset_mm: null, factory_spacers_mm: null, ...over,
});
const bike = (over: Record<string, unknown> = {}) => ({
  id: 'brand-model-2025', brand: 'Brand', model: 'Model', build: 'Pro', year: 2025, category: 'road_endurance', match_phrases: ['brand model'],
  source: { name: 'brand.com geometry chart', url: 'https://brand.example/geometry', verified_on: '2026-10-24', note: null },
  sizes: [row('S', 540, 370), row('M', 560, 380), row('L', 580, 390)], ...over,
});
const errorsOf = (over: Record<string, unknown>) => loadSeedBikes([bike(over)]).errors;

describe('loadSeedBikes: a good bike', () => {
  it('should map the columns of the file to the bike of the app', () => {
    const { bikes, errors } = loadSeedBikes([bike()]);
    expect(errors).toEqual([]);
    expect(bikes[0]).toMatchObject({ id: 'brand-model-2025', brand: 'Brand', model: 'Model', build: 'Pro', years: [2025], category: 'road_endurance', discipline: 'road', sizeOrder: ['S', 'M', 'L'], matchPhrases: ['brand model'] });
    expect(bikes[0].sizes.M).toEqual({ frameStackMm: 560, frameReachMm: 380, seatTubeAngleDeg: 73.5, topTubeMm: 540, headTubeMm: 150, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null });
    expect(bikes[0].source).toEqual({ name: 'brand.com geometry chart', url: 'https://brand.example/geometry', verifiedOn: '2026-10-24' });
  });

  it('should make a gravel bike the gravel discipline, and keep a source note', () => {
    const { bikes } = loadSeedBikes([bike({ category: 'gravel', source: { name: 'brand.com geometry chart', url: 'https://brand.example/g', verified_on: '2026-10-24', note: 'Only 2025 found.' } })]);
    expect(bikes[0].discipline).toBe('gravel');
    expect(bikes[0].source.note).toBe('Only 2025 found.');
  });

  it('should keep a number that the maker does not publish as null and drop an optional tube measure that is missing', () => {
    const { bikes, errors } = loadSeedBikes([bike({ sizes: [row('S', 540, 370, { stock_bar_width_mm: null, stock_crank_length_mm: null, top_tube_mm: null, head_tube_mm: null }), row('M', 560, 380)] })]);
    expect(errors).toEqual([]);
    expect(bikes[0].sizes.S).toMatchObject({ stockHandlebarMm: null, stockCrankMm: null });
    expect(bikes[0].sizes.S.topTubeMm).toBeUndefined();
  });

  it('should know every category of the specification', () => {
    expect(SEED_CATEGORIES).toEqual(['road_endurance', 'road_race', 'road_aero', 'road_allround', 'gravel']);
    for (const category of SEED_CATEGORIES) expect(errorsOf({ category })).toEqual([]);
  });
});

describe('loadSeedBikes: refusing what is not right (the bike is left out, never repaired)', () => {
  it.each([
    ['a file that is not a list', null],
    ['an entry that is not an object', ['x']],
  ])('should refuse %s', (_label, raw) => {
    expect(loadSeedBikes(raw).bikes).toEqual([]);
    expect(loadSeedBikes(raw).errors).toHaveLength(1);
  });

  it.each([
    ['an id with capitals', { id: 'Brand-Model' }],
    ['no brand', { brand: '' }],
    ['a year that is not a whole year', { year: 2024.5 }],
    ['an unknown category', { category: 'mountain' }],
    ['no match phrases', { match_phrases: [] }],
    ['a match phrase with capitals', { match_phrases: ['Brand Model'] }],
    ['no source', { source: null }],
    ['a source without https', { source: { name: 'brand.com chart', url: 'http://brand.example', verified_on: '2026-10-24' } }],
    ['a source without the day', { source: { name: 'brand.com chart', url: 'https://brand.example' } }],
    ['no sizes', { sizes: [] }],
    ['sizes that are not a list', { sizes: {} }],
    ['a size listed twice', { sizes: [row('M', 560, 380), row('M', 580, 390)] }],
    ['a size label with a space', { sizes: [row('big one', 560, 380)] }],
    ['sizes that do not grow in stack', { sizes: [row('S', 560, 370), row('M', 540, 380)] }],
    ['sizes that do not grow in reach', { sizes: [row('S', 540, 380), row('M', 560, 380)] }],
    ['a stack that is not plausible', { sizes: [row('S', 40, 370)] }],
    ['a reach that is not a number', { sizes: [row('S', 540, 'x')] }],
    ['a stem that is not plausible', { sizes: [row('S', 540, 370, { stock_stem_length_mm: 10 })] }],
    ['a crank that is not plausible', { sizes: [row('S', 540, 370, { stock_crank_length_mm: 17.25 })] }],
    ['a made up factory spacer height', { sizes: [row('S', 540, 370, { factory_spacers_mm: 27.5 })] }],
    ['a made up seat post offset', { sizes: [row('S', 540, 370, { stock_seatpost_offset_mm: 0 })] }],
  ])('should refuse %s', (_label, over) => {
    const result = loadSeedBikes([bike(over)]);
    expect(result.bikes).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain((over as { id?: string }).id ?? 'brand-model-2025');
  });

  it('should name the problem in words the owner can act on', () => {
    expect(errorsOf({ sizes: [row('S', 540, 370, { stock_stem_length_mm: 10 })] })[0]).toContain('stock_stem_length_mm (10) is out of range');
    expect(errorsOf({ sizes: [row('S', 540, 370, { factory_spacers_mm: 27.5 })] })[0]).toContain('factory_spacers_mm must be null');
    expect(errorsOf({ sizes: [row('S', 560, 370), row('M', 540, 380)] })[0]).toContain('list the sizes from the smallest');
  });

  it('should refuse a repeated id and keep the other bikes', () => {
    const result = loadSeedBikes([bike(), bike({ model: 'Copy' }), bike({ id: 'brand-other-2025', model: 'Other', match_phrases: ['brand other'] }), bike({ id: 'bad id' })]);
    expect(result.bikes.map((item) => item.id)).toEqual(['brand-model-2025', 'brand-other-2025']);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain('the id is used twice');
  });
});
