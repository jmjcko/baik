const compact = (text: string): string => text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/** The key of a bike size, the same one that the database computes (`public.bike_key`): letters and digits only, lowercase. */
export function bikeKey(brand: string, model: string, year: number, size: string): string {
  return `${compact(brand)}|${compact(model)}|${year}|${compact(size)}`;
}

/** The key without the size: one bike (brand, model, year) whatever its sizes. */
export function modelKey(brand: string, model: string, year: number): string {
  return `${compact(brand)}|${compact(model)}|${year}`;
}
