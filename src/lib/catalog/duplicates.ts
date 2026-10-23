import type { SizeSpec, StockBikeSpec } from '@/lib/bikes/types';
import { bikeKey, modelKey } from './key';
import type { BikeShare, CatalogRow } from './types';

export type DuplicateKind = 'same-key' | 'similar-name' | 'same-numbers';

/** A bike that is already known and looks like the candidate: the owner decides whether it is the same one. */
export interface Duplicate {
  kind: DuplicateKind;
  where: 'seed' | 'catalog';
  brand: string;
  model: string;
  year: number;
  size: string;
  spec: SizeSpec;
  /** Set for a catalog entry: the target of a merge. */
  catalogId?: string;
}

const compact = (text: string): string => text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/** Number of single character changes between two texts (small texts only). */
export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = row;
  }
  return previous[b.length];
}

/** Two model names that differ by a typo or by an added build name ("Attain GTC" and "Attain GTC SLX"). */
export function similarModels(a: string, b: string): boolean {
  const [x, y] = [compact(a), compact(b)];
  if (x === '' || y === '' || x === y) return false;
  return x.includes(y) || y.includes(x) || editDistance(x, y) <= 2;
}

const sameGeometry = (a: SizeSpec, b: SizeSpec): boolean =>
  a.frameStackMm === b.frameStackMm && a.frameReachMm === b.frameReachMm && a.seatTubeAngleDeg === b.seatTubeAngleDeg;

interface Known {
  where: Duplicate['where'];
  brand: string;
  model: string;
  year: number;
  size: string;
  spec: SizeSpec;
  catalogId?: string;
}

/** Every known size: the seed and the approved catalog. */
function knownBikes(seed: readonly StockBikeSpec[], catalog: CatalogRow[]): Known[] {
  const fromSeed = seed.flatMap((bike) => bike.sizeOrder.flatMap((size) => bike.years.map((year) => ({ where: 'seed' as const, brand: bike.brand, model: bike.model, year, size, spec: bike.sizes[size] }))));
  const fromCatalog = catalog.map((row) => ({ where: 'catalog' as const, brand: row.brand, model: row.model, year: row.year, size: row.size, spec: row.spec, catalogId: row.id }));
  return [...fromSeed, ...fromCatalog];
}

function kindOf(candidate: BikeShare, known: Known): DuplicateKind | null {
  if (bikeKey(candidate.brand, candidate.model, candidate.year, candidate.size) === bikeKey(known.brand, known.model, known.year, known.size)) return 'same-key';
  const sameModelYear = compact(candidate.brand) === compact(known.brand) && candidate.year === known.year && compact(candidate.size) === compact(known.size);
  if (sameModelYear && similarModels(candidate.model, known.model)) return 'similar-name';
  if (modelKey(candidate.brand, candidate.model, candidate.year) !== modelKey(known.brand, known.model, known.year) && sameGeometry(candidate.spec, known.spec)) return 'same-numbers';
  return null;
}

const ORDER: DuplicateKind[] = ['same-key', 'similar-name', 'same-numbers'];

/** Bikes that are already in the seed or the catalog and look like the candidate, the strongest match first. */
export function findDuplicates(candidate: BikeShare, seed: readonly StockBikeSpec[], catalog: CatalogRow[]): Duplicate[] {
  const found: Duplicate[] = [];
  for (const known of knownBikes(seed, catalog)) {
    const kind = kindOf(candidate, known);
    if (kind) found.push({ kind, ...known });
  }
  return found.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}
