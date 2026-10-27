import type { BikeShare } from '@/lib/catalog/types';
import { textOf } from './extraction';
import { parseSizeSpec } from './parseSizeSpec';
import type { TableSize } from './tableExtraction';
import type { StockBikeSpec } from './types';

const SIZE_LABEL = /^[A-Za-z0-9./+-]{1,12}$/;
const MAX_SIZES = 20;
const YEAR = [2000, 2035] as const;

/** A bike whose geometry table the rider supplied and checked: every size that was kept, from the smallest. It is not part of the catalog. */
export interface SuppliedBike {
  brand: string;
  model: string;
  year: number;
  sizes: TableSize[];
}

const byFrame = (a: TableSize, b: TableSize): number => a.spec.frameStackMm - b.spec.frameStackMm || a.spec.frameReachMm - b.spec.frameReachMm;

/** The bike of a reviewed table (the plan of the upload review), or null when it holds no size or the sizes belong to different bikes. */
export function suppliedFromShares(plan: BikeShare[]): SuppliedBike | null {
  const [first] = plan;
  if (!first || plan.some((share) => share.brand !== first.brand || share.model !== first.model || share.year !== first.year)) return null;
  return { brand: first.brand, model: first.model, year: first.year, sizes: plan.map((share) => ({ size: share.size, spec: share.spec })).sort(byFrame) };
}

/** The numbers of a supplied bike as shares, one per size (what sharing with other riders sends). */
export const sharesOfSupplied = (bike: SuppliedBike): BikeShare[] => bike.sizes.map(({ size, spec }) => ({ brand: bike.brand, model: bike.model, year: bike.year, size, spec }));

/** A supplied bike read back from storage: every size passes the same limits as a new one, a damaged one is dropped. */
export function parseSuppliedBike(raw: unknown): SuppliedBike | null {
  const item = (typeof raw === 'object' && raw !== null ? raw : null) as Record<string, unknown> | null;
  const brand = textOf(item?.brand);
  const model = textOf(item?.model);
  const year = item?.year;
  if (!item || !brand || !model || typeof year !== 'number' || !Number.isInteger(year) || year < YEAR[0] || year > YEAR[1] || !Array.isArray(item.sizes)) return null;
  const seen = new Set<string>();
  const sizes: TableSize[] = [];
  for (const row of item.sizes.slice(0, MAX_SIZES) as Array<{ size?: unknown; spec?: unknown }>) {
    const size = typeof row?.size === 'string' ? row.size : '';
    const spec = parseSizeSpec(row?.spec);
    if (SIZE_LABEL.test(size) && spec && !seen.has(size)) {
      seen.add(size);
      sizes.push({ size, spec });
    }
  }
  return sizes.length > 0 ? { brand, model, year, sizes: sizes.sort(byFrame) } : null;
}

/** A bike of the app made of sizes that are not in the seed (a supplied table), so that they are ranked and judged like those of the catalog. */
export function bikeOfSizes(id: string, bike: Pick<SuppliedBike, 'brand' | 'model' | 'year' | 'sizes'>, discipline: StockBikeSpec['discipline']): StockBikeSpec {
  const sizes = [...bike.sizes].sort(byFrame);
  return {
    id,
    brand: bike.brand,
    model: bike.model,
    build: 'Frame',
    years: [bike.year],
    discipline,
    sizeOrder: sizes.map((row) => row.size),
    sizes: Object.fromEntries(sizes.map((row) => [row.size, row.spec])),
    matchPhrases: [],
    source: { name: 'Geometry table supplied by the rider', url: 'https://example.invalid/supplied-by-the-rider', verifiedOn: new Date().toISOString().slice(0, 10) },
  };
}

export const bikeFromSupplied = bikeOfSizes;
