import { SIZE_LIMITS } from '@/lib/bikes/parseSizeSpec';
import type { ExtractedBike } from '@/lib/bikes/extraction';
import type { AiStockSelection, SizeSpec } from '@/lib/bikes/types';

/** What the rider sees and edits in the review card: every number as text, so an empty box can mean "not stated". */
export interface ReviewFields {
  brand: string;
  model: string;
  year: string;
  stack: string;
  reach: string;
  seatAngle: string;
  stem: string;
  handlebar: string;
  crank: string;
}

export type ReviewField = keyof ReviewFields;

const text = (value: number | null): string => (value === null ? '' : String(value));

export function fieldsOf(bike: ExtractedBike): ReviewFields {
  const { spec } = bike;
  return {
    brand: bike.brand,
    model: bike.model,
    year: text(bike.year),
    stack: String(spec.frameStackMm),
    reach: String(spec.frameReachMm),
    seatAngle: String(spec.seatTubeAngleDeg),
    stem: text(spec.stockStemMm),
    handlebar: text(spec.stockHandlebarMm),
    crank: text(spec.stockCrankMm),
  };
}

const LIMIT_KEY: Record<'stack' | 'reach' | 'seatAngle' | 'stem' | 'handlebar' | 'crank', keyof typeof SIZE_LIMITS> = {
  stack: 'frameStackMm', reach: 'frameReachMm', seatAngle: 'seatTubeAngleDeg', stem: 'stockStemMm', handlebar: 'stockHandlebarMm', crank: 'stockCrankMm',
};
const MAX_TEXT = 60;
const YEAR = [2000, 2035];
const REQUIRED_NUMBERS: ReviewField[] = ['stack', 'reach', 'seatAngle'];
const OPTIONAL_NUMBERS: ReviewField[] = ['stem', 'handlebar', 'crank'];

/** A typed number within its plausible range, or null (an empty box is not a number). */
function numberIn(raw: string, key: keyof typeof SIZE_LIMITS): number | null {
  const value = raw.trim() === '' ? NaN : Number(raw.replace(',', '.'));
  const [min, max] = SIZE_LIMITS[key];
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

/** The fields that cannot be used: brand, model and year are needed, so are stack, reach and seat angle; the stock parts only when typed. */
export function invalidFields(fields: ReviewFields): ReviewField[] {
  const bad: ReviewField[] = [];
  for (const key of ['brand', 'model'] as const) if (fields[key].trim() === '' || fields[key].length > MAX_TEXT) bad.push(key);
  const year = Number(fields.year);
  if (!Number.isInteger(year) || year < YEAR[0] || year > YEAR[1]) bad.push('year');
  for (const key of REQUIRED_NUMBERS) if (numberIn(fields[key], LIMIT_KEY[key as keyof typeof LIMIT_KEY]) === null) bad.push(key);
  for (const key of OPTIONAL_NUMBERS) if (fields[key].trim() !== '' && numberIn(fields[key], LIMIT_KEY[key as keyof typeof LIMIT_KEY]) === null) bad.push(key);
  return bad;
}

/** The bike that the rider confirmed, from fields that passed `invalidFields`; an empty stock part becomes null (never a guess). */
export function selectionOf(fields: ReviewFields, size: string, original: ExtractedBike): AiStockSelection {
  const optional = (key: 'stem' | 'handlebar' | 'crank') => (fields[key].trim() === '' ? null : numberIn(fields[key], LIMIT_KEY[key]));
  const spec: SizeSpec = {
    ...original.spec,
    frameStackMm: numberIn(fields.stack, 'frameStackMm') as number,
    frameReachMm: numberIn(fields.reach, 'frameReachMm') as number,
    seatTubeAngleDeg: numberIn(fields.seatAngle, 'seatTubeAngleDeg') as number,
    stockStemMm: optional('stem'),
    stockHandlebarMm: optional('handlebar'),
    stockCrankMm: optional('crank'),
  };
  return { source: 'ai', brand: fields.brand.trim(), model: fields.model.trim(), year: Number(fields.year), size, spec };
}
