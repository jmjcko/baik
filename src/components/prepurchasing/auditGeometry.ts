import { findStockBike, words as wordsOf } from '@/lib/bikes/lookup';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';
import type { StockBikeSpec } from '@/lib/bikes/types';
import type { PrePurchaseGeometry } from '@/types/baikfit';

/** A table that the rider supplied, tied to the name it was supplied for (a changed name is another bike). */
export interface SuppliedFor {
  name: string;
  bike: SuppliedBike;
}

export interface AuditGeometry {
  /** What the audit sends: the sizes and their numbers. */
  geometry: PrePurchaseGeometry;
  /** The bike as it is called in the catalog or in the supplied table, for the line under the name. */
  label: string;
  sizes: string[];
}

const same = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

const labelOf = (brand: string, model: string, year: number): string => `${brand} ${model} ${year}`;

/** The geometry of a bike of the catalog (every size, from the smallest). */
export function geometryOfBike(bike: StockBikeSpec, source: PrePurchaseGeometry['source'] = 'catalog'): AuditGeometry {
  const sizes = bike.sizeOrder.map((size) => ({ size, spec: bike.sizes[size] }));
  return { geometry: { source, sizes }, label: labelOf(bike.brand, bike.model, bike.years[0]), sizes: [...bike.sizeOrder] };
}

/**
 * Where the geometry of the typed bike comes from: the catalog first (seed or community, the exact build), otherwise the table that the
 * rider supplied for this very name, otherwise nowhere. The audit never runs without geometry (the model does not know the bike's numbers).
 */
export function auditGeometryOf(bikeModel: string, bikes: readonly StockBikeSpec[], supplied: SuppliedFor | null): AuditGeometry | null {
  const found = findStockBike(bikeModel, bikes)?.bike;
  if (found) return geometryOfBike(found);
  if (!supplied || !same(supplied.name, bikeModel)) return null;
  const { brand, model, year, sizes } = supplied.bike;
  return { geometry: { source: 'rider', sizes }, label: labelOf(brand, model, year), sizes: sizes.map((row) => row.size) };
}

/** The words of a text as typed, without joining a letter group to its number ("cf 8" stays "cf" and "8"; the joined "cf8" is added for the bike's own words). */
const plainWords = (text: string): string[] => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);

/** The name of a bike of the catalog as it is typed into the box. */
export const nameOfBike = (bike: Pick<StockBikeSpec, 'brand' | 'model' | 'years'>): string => `${bike.brand} ${bike.model} ${bike.years[0]}`;

/**
 * Bikes of the catalog that the typed text nearly names (for example the same model with a build word missing, "X-Road Team Elite" for
 * "X-Road Team Elite Di2"): most of the words of the bike are in the text. Up to three, the closest first; none when the text is exact.
 */
export function suggestBikes(text: string, bikes: readonly StockBikeSpec[]): StockBikeSpec[] {
  const typed = new Set(wordsOf(text));
  if (typed.size < 2 || findStockBike(text, bikes)) return [];
  return bikes
    .map((bike) => { const own = wordsOf(`${bike.brand} ${bike.model}`); return { bike, share: own.filter((word) => typed.has(word)).length / own.length, own: own.length }; })
    .filter(({ share, own }) => share >= 0.6 && own >= 2)
    .sort((a, b) => b.share - a.share)
    .slice(0, 3)
    .map(({ bike }) => bike);
}

/**
 * The bikes of the catalog for a text typed into the search box (full text, as the rider types): every typed word is the start of a word
 * of the brand, the model or the year (the last word may be unfinished). Nothing matches a nearly typed name ("X-Road Team Elite"
 * for "X-Road Team Elite Di2" is still found by this rule; a missing middle word is not, so the near match of `suggestBikes` follows).
 */
export function searchBikes(text: string, bikes: readonly StockBikeSpec[], limit = 6): StockBikeSpec[] {
  const typed = plainWords(text);
  if (typed.length === 0) return [];
  const hits = bikes.filter((bike) => {
    const label = `${bike.brand} ${bike.model} ${bike.years[0]}`;
    const own = [...plainWords(label), ...wordsOf(label)];
    return typed.every((word) => own.some((candidate) => candidate.startsWith(word)));
  });
  return (hits.length > 0 ? hits : suggestBikes(text, bikes)).slice(0, limit);
}
