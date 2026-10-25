import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { editDistance, findDuplicates, similarModels } from '../duplicates';
import type { CatalogRow } from '../types';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const row = (over: Partial<CatalogRow> = {}): CatalogRow => ({ id: 'c1', brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', key: 'cube|attaingtc|2024|54', spec: { ...spec, frameStackMm: 575, frameReachMm: 374 }, origin: 'community', confirmations: 2, note: null, autoApproved: false, ...over });
const candidate = (over = {}) => ({ brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', spec: { ...spec, frameStackMm: 575, frameReachMm: 374 }, ...over });

describe('editDistance and similarModels', () => {
  it('should count single character changes', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('', 'abc')).toBe(3);
    expect(editDistance('same', 'same')).toBe(0);
  });

  it('should call a typo or an added build name similar, but not a different model', () => {
    expect(similarModels('Attain GTC', 'Attain GTC SLX')).toBe(true);
    expect(similarModels('Atain GTC', 'Attain GTC')).toBe(true);
    expect(similarModels('Domane SL 6', 'Domane SL 6 Gen 4')).toBe(true);
    expect(similarModels('Attain', 'Agree')).toBe(false);
    expect(similarModels('Attain GTC', 'attain-gtc')).toBe(false);
    expect(similarModels('', 'Attain')).toBe(false);
  });
});

describe('findDuplicates', () => {
  it('should find the same bike in the catalog, whatever the spelling', () => {
    const found = findDuplicates(candidate({ brand: 'CUBE', model: 'attain  gtc' }), [], [row()]);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ kind: 'same-key', where: 'catalog', catalogId: 'c1' });
  });

  it('should find the same bike in the verified table (any of its years)', () => {
    const found = findDuplicates({ brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M', spec }, STOCK_BIKE_SPECS, []);
    expect(found[0]).toMatchObject({ kind: 'same-key', where: 'seed' });
    expect(found[0].catalogId).toBeUndefined();
  });

  it('should find a similar name with the same brand, year and size', () => {
    const found = findDuplicates(candidate({ model: 'Attain GTC SLX', spec: { ...spec, frameStackMm: 580 } }), [], [row()]);
    expect(found.map((d) => d.kind)).toEqual(['similar-name']);
  });

  it('should find the same numbers under another name, and not a similar name of another year or size', () => {
    expect(findDuplicates(candidate({ brand: 'Other', model: 'Thing' }), [], [row()]).map((d) => d.kind)).toEqual(['same-numbers']);
    expect(findDuplicates(candidate({ model: 'Attain GTC SLX', year: 2023, spec: { ...spec, frameStackMm: 580 } }), [], [row()])).toEqual([]);
    expect(findDuplicates(candidate({ model: 'Attain GTC SLX', size: '56', spec: { ...spec, frameStackMm: 580 } }), [], [row()])).toEqual([]);
  });

  it('should not call two sizes of the same bike duplicates and say nothing when nothing is known', () => {
    expect(findDuplicates(candidate({ size: '56', spec: { ...spec, frameStackMm: 595 } }), [], [row()])).toEqual([]);
    expect(findDuplicates(candidate(), [], [])).toEqual([]);
  });

  it('should list the strongest match first', () => {
    const rows = [row({ id: 'numbers', brand: 'Other', model: 'Thing', key: 'o' }), row({ id: 'similar', model: 'Attain GTC SLX', key: 's', spec: { ...spec, frameStackMm: 580 } }), row({ id: 'same' })];
    const found = findDuplicates(candidate(), [], rows);
    expect(found.map((d) => d.catalogId)).toEqual(['same', 'similar', 'numbers']);
    expect(found.map((d) => d.kind)).toEqual(['same-key', 'similar-name', 'same-numbers']);
  });
});
