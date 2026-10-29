import type { SizeSpec, StockBikeSpec } from '@/lib/bikes/types';
import { modelKey } from '@/lib/catalog/key';
import type { CatalogRow } from '@/lib/catalog/types';

/** Where a listed bike comes from: the seed file (read only), the owner's own upload or what riders shared. */
export type ListSource = 'seed' | 'owner' | 'community';

/** One bike (brand, model, year) with all its sizes: one row of the admin table. */
export interface ListedBike {
  key: string;
  brand: string;
  model: string;
  year: number;
  source: ListSource;
  /** Sizes from the smallest to the largest, with their numbers. */
  sizes: Array<[string, SizeSpec]>;
  /** The catalog rows of this bike (empty for a seed bike, which is not deleted here). */
  rows: CatalogRow[];
  confirmations: number;
  autoApproved: boolean;
  note: string | null;
}

export type SortKey = 'brand' | 'model' | 'year' | 'sizes' | 'source';
export type SortDirection = 'asc' | 'desc';

const byStack = (a: [string, SizeSpec], b: [string, SizeSpec]) => a[1].frameStackMm - b[1].frameStackMm;

function fromRows(key: string, rows: CatalogRow[]): ListedBike {
  const first = rows[0];
  return {
    key: `catalog|${key}`, brand: first.brand, model: first.model, year: first.year,
    source: rows.some((row) => row.origin === 'owner') ? 'owner' : 'community',
    sizes: rows.map((row): [string, SizeSpec] => [row.size, row.spec]).sort(byStack),
    rows, confirmations: Math.max(...rows.map((row) => row.confirmations)), autoApproved: rows.every((row) => row.autoApproved === true),
    note: rows.find((row) => row.note)?.note ?? null,
  };
}

const fromSeed = (bike: StockBikeSpec): ListedBike => ({
  key: `seed|${bike.id}`, brand: bike.brand, model: bike.model, year: bike.years[0], source: 'seed',
  sizes: bike.sizeOrder.map((size): [string, SizeSpec] => [size, bike.sizes[size]]), rows: [], confirmations: 0, autoApproved: false, note: null,
});

/** Every bike the app knows, the seed and the catalog together, one entry per brand, model and year. */
export function listBikes(catalog: readonly CatalogRow[], seed: readonly StockBikeSpec[]): ListedBike[] {
  const groups = new Map<string, CatalogRow[]>();
  for (const row of catalog) {
    const key = modelKey(row.brand, row.model, row.year);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...seed.map(fromSeed), ...[...groups.entries()].map(([key, rows]) => fromRows(key, rows))];
}

const textOf = (bike: ListedBike): string => `${bike.brand} ${bike.model} ${bike.year}`.toLowerCase();

/** The bikes whose brand, model or year contain every word typed in the search box. */
export function filterBikes(bikes: readonly ListedBike[], text: string): ListedBike[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return bikes.filter((bike) => words.every((word) => textOf(bike).includes(word)));
}

const SOURCE_ORDER: Record<ListSource, number> = { seed: 0, owner: 1, community: 2 };

function compare(a: ListedBike, b: ListedBike, key: SortKey): number {
  if (key === 'year') return a.year - b.year;
  if (key === 'sizes') return a.sizes.length - b.sizes.length;
  if (key === 'source') return SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source];
  return a[key].localeCompare(b[key]);
}

/** Sorted by the chosen column; equal values keep the order brand, model, year. */
export function sortBikes(bikes: readonly ListedBike[], key: SortKey, direction: SortDirection): ListedBike[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...bikes].sort((a, b) => sign * compare(a, b, key) || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model) || a.year - b.year);
}
