import type { SeedCategory } from '@/lib/bikes/seedLoader';
import type { BikeShare } from './types';

/** One bike of the catalog (all its sizes), as the admin lists it for the export. */
export interface CatalogBike {
  id: string;
  label: string;
  rows: BikeShare[];
}

export interface SeedExportOptions {
  category: SeedCategory;
  /** https address of the maker's table the numbers were read from. */
  sourceUrl: string;
  /** Day the numbers were read (YYYY-MM-DD). */
  verifiedOn: string;
}

const slug = (text: string): string => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const phrase = (text: string): string => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const DEFAULT_BUILD = 'Frame';

/** Groups the catalog rows into bikes (brand, model, year), smallest size first. */
export function groupCatalogBikes(rows: BikeShare[]): CatalogBike[] {
  const bikes = new Map<string, CatalogBike>();
  for (const row of rows) {
    const id = slug(`${row.brand} ${row.model} ${row.year}`);
    const bike = bikes.get(id) ?? { id, label: `${row.brand} ${row.model} ${row.year}`, rows: [] };
    bike.rows.push(row);
    bikes.set(id, bike);
  }
  return [...bikes.values()]
    .map((bike) => ({ ...bike, rows: [...bike.rows].sort((a, b) => a.spec.frameStackMm - b.spec.frameStackMm) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function sizeRow(row: BikeShare): Record<string, unknown> {
  const s = row.spec;
  const optional = { top_tube_mm: s.topTubeMm, head_tube_mm: s.headTubeMm, stock_stem_length_mm: s.stockStemMm, stock_bar_width_mm: s.stockHandlebarMm, stock_crank_length_mm: s.stockCrankMm };
  return {
    size: row.size,
    stack_mm: s.frameStackMm,
    reach_mm: s.frameReachMm,
    seat_tube_angle_deg: s.seatTubeAngleDeg,
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== null && value !== undefined)),
    stock_seatpost_offset_mm: null,
    factory_spacers_mm: null,
  };
}

/** The entry of one bike for seedBikes.json. Spacers and seatpost offset stay null (project rule); the loader checks the rest. */
export function catalogBikeToSeedEntry(bike: CatalogBike, options: SeedExportOptions): Record<string, unknown> {
  const first = bike.rows[0];
  return {
    id: bike.id,
    brand: first.brand,
    model: first.model,
    build: DEFAULT_BUILD,
    year: first.year,
    category: options.category,
    match_phrases: [phrase(`${first.brand} ${first.model}`)],
    source: { name: `${first.brand} geometry table (admin upload)`, url: options.sourceUrl.trim(), verified_on: options.verifiedOn },
    sizes: bike.rows.map(sizeRow),
  };
}

/** The whole seed file with the entry added; an entry with the same id is replaced. */
export function mergeSeedEntry(seed: readonly unknown[], entry: Record<string, unknown>): unknown[] {
  const others = seed.filter((item) => (item as { id?: unknown } | null)?.id !== entry.id);
  return [...others, entry];
}

export const toSeedFileText = (seed: readonly unknown[]): string => `${JSON.stringify(seed, null, 2)}\n`;
