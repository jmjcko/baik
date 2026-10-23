import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { BikeName } from '@/lib/bikes/parseBikeName';
import type { TableSize } from '@/lib/bikes/tableExtraction';
import { findDuplicates } from '@/lib/catalog/duplicates';
import type { BikeShare, CatalogRow } from '@/lib/catalog/types';
import { invalidFields, selectionOf, type ReviewField } from '@/components/wizard/stock/reviewForm';
import type { RowStatus, SizeRow } from './SizesTable';

const HEAD: ReviewField[] = ['brand', 'model', 'year'];
const text = (value: number | null): string => (value === null ? '' : String(value));

/** The rows of the table: every number as text, an empty box where the tables state nothing. */
export const rowsOf = (sizes: TableSize[]): SizeRow[] =>
  sizes.map(({ size, spec }) => ({
    size,
    include: true,
    fields: { stack: String(spec.frameStackMm), reach: String(spec.frameReachMm), seatAngle: String(spec.seatTubeAngleDeg), stem: text(spec.stockStemMm), handlebar: text(spec.stockHandlebarMm), crank: text(spec.stockCrankMm) },
  }));

const fieldsOf = (head: BikeName, row: SizeRow) => ({ ...head, ...row.fields });

/** Brand, model or year that cannot be used (the same for every row). */
export const headBad = (head: BikeName, rows: SizeRow[]): ReviewField[] => invalidFields(fieldsOf(head, rows[0])).filter((key) => HEAD.includes(key));

/** Numbers of one row that cannot be used. */
export const rowBad = (head: BikeName, row: SizeRow): ReviewField[] => invalidFields(fieldsOf(head, row)).filter((key) => !HEAD.includes(key));

/** The bike size of a row that passed the checks; the numbers that the table does not show (top tube, head tube) are kept from the reading. */
function bikeOf(head: BikeName, row: SizeRow, original: TableSize): BikeShare {
  const selection = selectionOf(fieldsOf(head, row), row.size, { brand: head.brand, model: head.model, year: null, size: row.size, spec: original.spec });
  return { brand: selection.brand, model: selection.model, year: selection.year, size: selection.size, spec: selection.spec };
}

/** What saving does to a row: it adds a bike, replaces a catalog entry, or is not used because the verified table has the bike. */
export function statusOf(head: BikeName, row: SizeRow, original: TableSize, catalog: CatalogRow[]): RowStatus {
  if (headBad(head, [row]).length > 0 || rowBad(head, row).length > 0) return 'new';
  const same = findDuplicates(bikeOf(head, row, original), STOCK_BIKE_SPECS, catalog).filter((item) => item.kind === 'same-key');
  if (same.some((item) => item.where === 'seed')) return 'seed';
  return same.length > 0 ? 'replaces' : 'new';
}

/** The bikes to save, or null when nothing is ticked or a ticked row (or the name) has a number that cannot be used. */
export function planSave(head: BikeName, rows: SizeRow[], sizes: TableSize[]): BikeShare[] | null {
  const chosen = rows.flatMap((row, index) => (row.include ? [{ row, original: sizes[index] }] : []));
  if (chosen.length === 0 || headBad(head, rows).length > 0 || chosen.some(({ row }) => rowBad(head, row).length > 0)) return null;
  return chosen.map(({ row, original }) => bikeOf(head, row, original));
}
