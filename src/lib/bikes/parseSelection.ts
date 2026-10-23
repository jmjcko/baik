import { parseSizeSpec } from './parseSizeSpec';
import type { StockSelection } from './types';

const MAX_TEXT = 60;
const MAX_ID = 64;
const MAX_SIZE = 12;
const YEAR = [2000, 2035] as const;

const isText = (value: unknown, max: number): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

/** A line of text from the AI or from storage: trimmed and without control characters. */
const clean = (value: string): string => value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

const MAX_CONFIRMATIONS = 100_000;

/** The bike fields that an AI bike and a community bike share, or null. */
function parseBikeFields(item: Record<string, unknown>) {
  const spec = parseSizeSpec(item.spec);
  const year = item.year;
  const validYear = typeof year === 'number' && Number.isInteger(year) && year >= YEAR[0] && year <= YEAR[1];
  if (!isText(item.size, MAX_SIZE) || !isText(item.brand, MAX_TEXT) || !isText(item.model, MAX_TEXT) || !spec || !validYear) return null;
  return { brand: clean(item.brand), model: clean(item.model), year, size: clean(item.size), spec };
}

/** Checks the stock bike of a stored passport; anything malformed is dropped (the bike then has no factory setup). */
export function parseStockSelection(raw: unknown): StockSelection | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const item = raw as Record<string, unknown>;
  if (item.source === 'seed') {
    return isText(item.bikeId, MAX_ID) && isText(item.size, MAX_SIZE) ? { source: 'seed', bikeId: item.bikeId, size: clean(item.size) } : null;
  }
  const fields = parseBikeFields(item);
  if (!fields) return null;
  if (item.source === 'ai') return { source: 'ai', ...fields };
  const { confirmations, origin } = item;
  const okConfirmations = typeof confirmations === 'number' && Number.isInteger(confirmations) && confirmations >= 0 && confirmations <= MAX_CONFIRMATIONS;
  return item.source === 'community' && okConfirmations && (origin === 'owner' || origin === 'community')
    ? { source: 'community', ...fields, origin, confirmations }
    : null;
}
