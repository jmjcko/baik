import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { CatalogRow } from '@/lib/catalog/types';
import { filterBikes, listBikes, sortBikes } from '../catalogListing';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const row = (over: Partial<CatalogRow>): CatalogRow => ({ id: 'x', brand: 'Wilier Triestina', model: 'Garda', year: 2026, size: 'M', key: 'k', spec, origin: 'owner', confirmations: 0, note: null, autoApproved: false, ...over } as CatalogRow);

describe('catalog listing', () => {
  const sizes = [row({ id: '1', size: 'L', spec: { ...spec, frameStackMm: 566 } }), row({ id: '2', size: 'S', spec: { ...spec, frameStackMm: 531 } })];

  it('should group the sizes of one bike into one entry, the smallest first, and list the seed bikes next to it', () => {
    const list = listBikes(sizes, STOCK_BIKE_SPECS);
    const garda = list.filter((bike) => bike.brand === 'Wilier Triestina');
    expect(garda).toHaveLength(1);
    expect(garda[0].sizes.map(([size]) => size)).toEqual(['S', 'L']);
    expect(garda[0].rows.map((one) => one.id)).toEqual(['1', '2']);
    expect(list.filter((bike) => bike.source === 'seed')).toHaveLength(STOCK_BIKE_SPECS.length);
    expect(list.filter((bike) => bike.source === 'seed').every((bike) => bike.rows.length === 0)).toBe(true);
  });

  it('should call a bike the owner\'s when any size is, and a community bike otherwise', () => {
    expect(listBikes([...sizes, row({ id: '3', origin: 'community', size: 'M' })], [])[0].source).toBe('owner');
    expect(listBikes([row({ origin: 'community', confirmations: 2 })], [])[0]).toMatchObject({ source: 'community', confirmations: 2 });
  });

  it('should filter by every typed word in brand, model or year, and sort by a column in both directions', () => {
    const list = listBikes(sizes, STOCK_BIKE_SPECS);
    expect(filterBikes(list, 'wilier 2026')).toHaveLength(1);
    expect(filterBikes(list, 'wilier 2025')).toHaveLength(0);
    expect(filterBikes(list, '')).toHaveLength(list.length);
    expect(sortBikes(list, 'brand', 'asc')[0].brand).toBe('Canyon');
    expect(sortBikes(list, 'brand', 'desc')[0].brand).toBe('Wilier Triestina');
    expect(sortBikes(list, 'source', 'desc')[0].source).toBe('owner');
  });
});
