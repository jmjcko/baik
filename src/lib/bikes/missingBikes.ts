import type { StockBikeSpec } from './types';

/** A key model whose current table the seed file should have; the owner adds it from a screenshot and states the model year there. */
export interface WantedBike {
  id: string;
  brand: string;
  model: string;
  /** Home page of the maker (official site); the model page is found there, a deep link is never guessed. */
  siteUrl: string;
}

export const WANTED_BIKES: readonly WantedBike[] = [
  { id: 'specialized-tarmac-sl8', brand: 'Specialized', model: 'Tarmac SL8', siteUrl: 'https://www.specialized.com' },
  { id: 'specialized-roubaix-sl8', brand: 'Specialized', model: 'Roubaix SL8', siteUrl: 'https://www.specialized.com' },
  { id: 'trek-domane-sl', brand: 'Trek', model: 'Domane SL', siteUrl: 'https://www.trekbikes.com' },
  { id: 'trek-madone-sl', brand: 'Trek', model: 'Madone SL', siteUrl: 'https://www.trekbikes.com' },
  { id: 'cube-attain', brand: 'Cube', model: 'Attain', siteUrl: 'https://www.cube.eu' },
  { id: 'cube-nuroad', brand: 'Cube', model: 'Nuroad', siteUrl: 'https://www.cube.eu' },
  { id: 'giant-tcr-advanced', brand: 'Giant', model: 'TCR Advanced', siteUrl: 'https://www.giant-bicycles.com' },
  { id: 'giant-defy-advanced', brand: 'Giant', model: 'Defy Advanced', siteUrl: 'https://www.giant-bicycles.com' },
  { id: 'scott-addict-rc', brand: 'Scott', model: 'Addict RC', siteUrl: 'https://www.scott-sports.com' },
  { id: 'orbea-orca', brand: 'Orbea', model: 'Orca', siteUrl: 'https://www.orbea.com' },
];

/** A bike of the seed file or the catalog. */
export interface KnownBike { brand: string; model: string; year: number }

const norm = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const same = (wanted: WantedBike, known: KnownBike): boolean =>
  norm(known.brand) === norm(wanted.brand) && (norm(known.model).includes(norm(wanted.model)) || norm(wanted.model).includes(norm(known.model)));

export const seedKnown = (seed: readonly StockBikeSpec[]): KnownBike[] => seed.flatMap((bike) => bike.years.map((year) => ({ brand: bike.brand, model: bike.model, year })));

/** The model years of the wanted bike that are already known, newest first (the owner then sees what a new table would add). */
export const knownYears = (wanted: WantedBike, known: readonly KnownBike[]): number[] =>
  [...new Set(known.filter((item) => same(wanted, item)).map((item) => item.year))].sort((a, b) => b - a);

const BRAND_SITES: Record<string, string> = { ...Object.fromEntries(WANTED_BIKES.map((bike) => [norm(bike.brand), bike.siteUrl])), canyon: 'https://www.canyon.com' };

/** The official site of a known brand, used as the source address of a seed entry (the owner types an address only for another brand). */
export const brandSiteUrl = (brand: string): string | null => BRAND_SITES[norm(brand)] ?? null;
