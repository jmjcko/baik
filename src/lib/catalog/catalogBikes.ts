import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { SizeSpec, StockBikeSpec } from '@/lib/bikes/types';
import { modelKey } from './key';
import type { CatalogOrigin, CatalogRow } from './types';

export interface CatalogMeta {
  origin: CatalogOrigin;
  confirmations: number;
}

export interface CatalogBikes {
  bikes: StockBikeSpec[];
  /** Origin and confirmations of one size of a catalog bike (the picker and the report show them). */
  metaOf: (bikeId: string, size: string) => CatalogMeta | undefined;
}

export const COMMUNITY_ID_PREFIX = 'community-';

const byStack = (a: [string, SizeSpec], b: [string, SizeSpec]) => a[1].frameStackMm - b[1].frameStackMm;

/** The approved sizes of the catalog grouped into bikes (brand, model, year) like the seed bikes, smallest size first. */
export function bikesFromCatalog(rows: CatalogRow[]): CatalogBikes {
  const groups = new Map<string, CatalogRow[]>();
  for (const row of rows) groups.set(modelKey(row.brand, row.model, row.year), [...(groups.get(modelKey(row.brand, row.model, row.year)) ?? []), row]);
  const meta = new Map<string, CatalogMeta>();
  const bikes = [...groups.entries()].map(([key, group]): StockBikeSpec => {
    const id = `${COMMUNITY_ID_PREFIX}${key}`;
    const sizes = group.map((row): [string, SizeSpec] => [row.size, row.spec]).sort(byStack);
    for (const row of group) meta.set(`${id}|${row.size}`, { origin: row.origin, confirmations: row.confirmations });
    const first = group[0];
    return {
      id, brand: first.brand, model: first.model, build: '', years: [first.year], discipline: 'road',
      sizeOrder: sizes.map(([size]) => size), sizes: Object.fromEntries(sizes), matchPhrases: [],
      source: { name: 'Community catalog', url: '', verifiedOn: '' },
    };
  });
  return { bikes, metaOf: (bikeId, size) => meta.get(`${bikeId}|${size}`) };
}

/** The seed and the catalog together; a catalog bike that the seed already has (same brand, model and year) is left out, the seed wins. */
export function mergeBikes(catalogBikes: StockBikeSpec[], seed: readonly StockBikeSpec[] = STOCK_BIKE_SPECS): StockBikeSpec[] {
  const inSeed = new Set(seed.flatMap((bike) => bike.years.map((year) => modelKey(bike.brand, bike.model, year))));
  return [...seed, ...catalogBikes.filter((bike) => !inSeed.has(modelKey(bike.brand, bike.model, bike.years[0])))];
}
