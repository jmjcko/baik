import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { COMMUNITY_ID_PREFIX, bikesFromCatalog, mergeBikes } from '../catalogBikes';
import type { CatalogRow } from '../types';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const row = (over: Partial<CatalogRow> = {}): CatalogRow => ({ id: 'c1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'k', spec: { ...spec, frameStackMm: 575 }, origin: 'community', confirmations: 2, note: null, ...over });

describe('bikesFromCatalog', () => {
  it('should group the sizes of a bike, the smallest first, with origin and confirmations per size', () => {
    const { bikes, metaOf } = bikesFromCatalog([row({ id: 'b', size: '56', spec: { ...spec, frameStackMm: 595 }, origin: 'owner', confirmations: 0 }), row({ id: 'a' }), row({ id: 'c', brand: 'Trek', model: 'Other', size: 'M' })]);
    expect(bikes.map((bike) => `${bike.brand} ${bike.model}`)).toEqual(['Cube Attain', 'Trek Other']);
    const cube = bikes[0];
    expect(cube.id).toBe(`${COMMUNITY_ID_PREFIX}cube|attain|2024`);
    expect(cube.sizeOrder).toEqual(['54', '56']);
    expect(cube.years).toEqual([2024]);
    expect(metaOf(cube.id, '54')).toEqual({ origin: 'community', confirmations: 2 });
    expect(metaOf(cube.id, '56')).toEqual({ origin: 'owner', confirmations: 0 });
    expect(metaOf(cube.id, '99')).toBeUndefined();
  });

  it('should give no bikes for an empty catalog', () => {
    expect(bikesFromCatalog([]).bikes).toEqual([]);
  });
});

describe('mergeBikes', () => {
  it('should put the seed first and the catalog bikes after it', () => {
    const merged = mergeBikes(bikesFromCatalog([row()]).bikes);
    expect(merged.slice(0, STOCK_BIKE_SPECS.length)).toEqual([...STOCK_BIKE_SPECS]);
    expect(merged.at(-1)?.brand).toBe('Cube');
  });

  it('should leave out a catalog bike that the seed already has: the seed wins', () => {
    const merged = mergeBikes(bikesFromCatalog([row({ brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M' })]).bikes);
    expect(merged).toHaveLength(STOCK_BIKE_SPECS.length);
    expect(merged.every((bike) => !bike.id.startsWith(COMMUNITY_ID_PREFIX))).toBe(true);
  });

  it('should keep a catalog bike of another year of a seed model', () => {
    expect(mergeBikes(bikesFromCatalog([row({ brand: 'Canyon', model: 'Endurace CF 8', year: 2023 })]).bikes)).toHaveLength(STOCK_BIKE_SPECS.length + 1);
  });
});
