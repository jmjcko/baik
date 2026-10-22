import { parseSizeSpec } from './parseSizeSpec';
import type { StockSelection } from './types';

const MAX_TEXT = 60;
const MAX_ID = 64;
const MAX_SIZE = 12;
const YEAR = [2000, 2035] as const;

const isText = (value: unknown, max: number): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

/** A line of text from the AI or from storage: trimmed and without control characters. */
const clean = (value: string): string => value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

/** Checks the stock bike of a stored passport; anything malformed is dropped (the bike then has no factory setup). */
export function parseStockSelection(raw: unknown): StockSelection | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const item = raw as Record<string, unknown>;
  if (!isText(item.size, MAX_SIZE)) return null;
  if (item.source === 'seed') return isText(item.bikeId, MAX_ID) ? { source: 'seed', bikeId: item.bikeId, size: clean(item.size) } : null;
  if (item.source !== 'ai' || !isText(item.brand, MAX_TEXT) || !isText(item.model, MAX_TEXT)) return null;
  const spec = parseSizeSpec(item.spec);
  const year = item.year;
  const validYear = typeof year === 'number' && Number.isInteger(year) && year >= YEAR[0] && year <= YEAR[1];
  return spec && validYear ? { source: 'ai', brand: clean(item.brand), model: clean(item.model), year, size: clean(item.size), spec } : null;
}
