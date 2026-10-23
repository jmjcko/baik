import type { StockBikeSpec } from './types';

/** A key model that the seed file should have; the owner adds it from a screenshot of the maker's table. */
export interface WantedBike {
  id: string;
  brand: string;
  model: string;
  year: number;
  /** Home page of the maker (official site); the model page is found there, a deep link is never guessed. */
  siteUrl: string;
}

export const WANTED_BIKES: readonly WantedBike[] = [
  { id: 'specialized-tarmac-sl8-2024', brand: 'Specialized', model: 'Tarmac SL8', year: 2024, siteUrl: 'https://www.specialized.com' },
  { id: 'specialized-roubaix-sl8-2024', brand: 'Specialized', model: 'Roubaix SL8', year: 2024, siteUrl: 'https://www.specialized.com' },
  { id: 'trek-domane-sl-2024', brand: 'Trek', model: 'Domane SL', year: 2024, siteUrl: 'https://www.trekbikes.com' },
  { id: 'trek-madone-sl-2024', brand: 'Trek', model: 'Madone SL', year: 2024, siteUrl: 'https://www.trekbikes.com' },
  { id: 'cube-attain-2025', brand: 'Cube', model: 'Attain', year: 2025, siteUrl: 'https://www.cube.eu' },
  { id: 'cube-nuroad-2024', brand: 'Cube', model: 'Nuroad', year: 2024, siteUrl: 'https://www.cube.eu' },
  { id: 'giant-tcr-advanced-2024', brand: 'Giant', model: 'TCR Advanced', year: 2024, siteUrl: 'https://www.giant-bicycles.com' },
  { id: 'giant-defy-advanced-2024', brand: 'Giant', model: 'Defy Advanced', year: 2024, siteUrl: 'https://www.giant-bicycles.com' },
  { id: 'scott-addict-rc-2024', brand: 'Scott', model: 'Addict RC', year: 2024, siteUrl: 'https://www.scott-sports.com' },
  { id: 'orbea-orca-2024', brand: 'Orbea', model: 'Orca', year: 2024, siteUrl: 'https://www.orbea.com' },
];

export type WantedStatus = 'missing' | 'inSeed' | 'inCatalog';

/** A bike of the same brand, a model that contains the wanted one (or the other way round) and the same year. */
export interface KnownBike { brand: string; model: string; year: number }

const norm = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const same = (wanted: WantedBike, known: KnownBike): boolean =>
  norm(known.brand) === norm(wanted.brand) && known.year === wanted.year && (norm(known.model).includes(norm(wanted.model)) || norm(wanted.model).includes(norm(known.model)));

export const seedKnown = (seed: readonly StockBikeSpec[]): KnownBike[] => seed.flatMap((bike) => bike.years.map((year) => ({ brand: bike.brand, model: bike.model, year })));

/** Whether the wanted bike is already in the seed file, in the catalog, or still missing. */
export function wantedStatus(wanted: WantedBike, seed: readonly KnownBike[], catalog: readonly KnownBike[]): WantedStatus {
  if (seed.some((known) => same(wanted, known))) return 'inSeed';
  return catalog.some((known) => same(wanted, known)) ? 'inCatalog' : 'missing';
}
