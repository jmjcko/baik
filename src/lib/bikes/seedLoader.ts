import { MTB_SIZE_LIMITS, SIZE_LIMITS, parseSizeSpec, type SizeLimits } from './parseSizeSpec';
import type { SizeSpec, StockBikeSpec } from './types';

/** The kinds of bike of the seed file; gravel bikes are the gravel discipline, mountain bikes (full suspension and hardtail together) the mountain discipline, the rest are road. */
export const SEED_CATEGORIES = ['road_endurance', 'road_race', 'road_aero', 'road_allround', 'gravel', 'mtb'] as const;
export type SeedCategory = (typeof SEED_CATEGORIES)[number];

export interface SeedLoadResult {
  /** The bikes that passed every check. */
  bikes: StockBikeSpec[];
  /** One line per problem: the bike (by id) and what is wrong. A bike with a problem is left out, never repaired. */
  errors: string[];
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown, min = 1, max = 60): value is string => typeof value === 'string' && value.trim().length >= min && value.length <= max;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHRASE = /^[a-z0-9]+(?: [a-z0-9]+)*$/;
const SIZE_LABEL = /^[A-Za-z0-9./+-]{1,12}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const YEARS = [2000, 2035] as const;

const DISCIPLINE_OF: Record<SeedCategory, StockBikeSpec['discipline']> = { road_endurance: 'road', road_race: 'road', road_aero: 'road', road_allround: 'road', gravel: 'gravel', mtb: 'xc_mtb' };

/** The columns of a size row of the seed file and the field of the app that each one fills. */
const COLUMNS = {
  stack_mm: 'frameStackMm',
  reach_mm: 'frameReachMm',
  seat_tube_angle_deg: 'seatTubeAngleDeg',
  top_tube_mm: 'topTubeMm',
  head_tube_mm: 'headTubeMm',
  stock_stem_length_mm: 'stockStemMm',
  stock_bar_width_mm: 'stockHandlebarMm',
  stock_crank_length_mm: 'stockCrankMm',
} as const;

/** What the makers do not publish: the seed keeps these null (owner ruling 2026-10-24), the audit then uses the estimates of the KB. */
const ALWAYS_NULL = ['stock_seatpost_offset_mm', 'factory_spacers_mm'] as const;

/** One size row: the checked numbers, or the reason it was refused. A number that is out of range is an error, never silently dropped. */
function parseSize(row: unknown, limits: SizeLimits): { size: string; spec: SizeSpec } | string {
  if (!isObject(row) || typeof row.size !== 'string' || !SIZE_LABEL.test(row.size)) return 'a size row without a plain size label';
  const where = `size ${row.size}`;
  for (const key of ALWAYS_NULL) if (row[key] !== null && row[key] !== undefined) return `${where}: ${key} must be null (the makers do not publish it)`;
  const input = Object.fromEntries(Object.entries(COLUMNS).map(([column, field]) => [field, row[column] ?? undefined]));
  const spec = parseSizeSpec({ ...input, stockSeatpostOffsetMm: null, stockSpacersMm: null }, limits);
  if (!spec) return `${where}: stack, reach or seat tube angle is missing or out of range`;
  for (const [column, field] of Object.entries(COLUMNS)) {
    const given = row[column];
    if (given !== null && given !== undefined && (spec as unknown as Json)[field] !== given) return `${where}: ${column} (${String(given)}) is out of range`;
  }
  return { size: row.size, spec };
}

function parseSizes(raw: unknown, limits: SizeLimits): { sizes: Record<string, SizeSpec>; order: string[] } | string {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return 'sizes must be a list of 1 to 20 rows';
  const sizes: Record<string, SizeSpec> = {};
  const order: string[] = [];
  for (const row of raw) {
    const parsed = parseSize(row, limits);
    if (typeof parsed === 'string') return parsed;
    if (sizes[parsed.size]) return `size ${parsed.size} is listed twice`;
    const previous = sizes[order[order.length - 1]];
    if (previous && (parsed.spec.frameStackMm <= previous.frameStackMm || parsed.spec.frameReachMm <= previous.frameReachMm)) return `size ${parsed.size} does not grow in stack and reach: list the sizes from the smallest`;
    sizes[parsed.size] = parsed.spec;
    order.push(parsed.size);
  }
  return { sizes, order };
}

/** The source of the numbers: a name, an https address and the day they were read, so that anyone can check them. */
function parseSource(raw: unknown): StockBikeSpec['source'] | string {
  if (!isObject(raw) || !isText(raw.name, 5, 200) || typeof raw.url !== 'string' || !/^https:\/\/\S+$/.test(raw.url) || typeof raw.verified_on !== 'string' || !DAY.test(raw.verified_on)) return 'source needs a name, an https address and the day it was read (YYYY-MM-DD)';
  if (raw.note !== null && raw.note !== undefined && !isText(raw.note, 1, 400)) return 'source note must be a short text or null';
  return { name: raw.name, url: raw.url, verifiedOn: raw.verified_on, ...(typeof raw.note === 'string' ? { note: raw.note } : {}) };
}

function parseIdentity(item: Json): string | null {
  if (typeof item.id !== 'string' || !ID.test(item.id)) return 'id must be lowercase words joined by dashes';
  if (!isText(item.brand) || !isText(item.model) || !isText(item.build)) return 'brand, model and build must be short texts';
  if (!Number.isInteger(item.year) || (item.year as number) < YEARS[0] || (item.year as number) > YEARS[1]) return 'year must be a whole year';
  if (!SEED_CATEGORIES.includes(item.category as SeedCategory)) return `category must be one of ${SEED_CATEGORIES.join(', ')}`;
  const phrases = item.match_phrases;
  if (!Array.isArray(phrases) || phrases.length === 0 || !phrases.every((phrase) => typeof phrase === 'string' && PHRASE.test(phrase) && phrase.length <= 60)) return 'match_phrases must be lowercase words (letters and numbers only)';
  return null;
}

function parseBike(item: unknown): StockBikeSpec | string {
  if (!isObject(item)) return 'an entry that is not an object';
  const problem = parseIdentity(item);
  if (problem) return problem;
  const source = parseSource(item.source);
  if (typeof source === 'string') return source;
  const sizes = parseSizes(item.sizes, item.category === 'mtb' ? MTB_SIZE_LIMITS : SIZE_LIMITS);
  if (typeof sizes === 'string') return sizes;
  return {
    id: item.id as string,
    brand: item.brand as string,
    model: item.model as string,
    build: item.build as string,
    years: [item.year as number],
    category: item.category as SeedCategory,
    discipline: DISCIPLINE_OF[item.category as SeedCategory],
    sizeOrder: sizes.order,
    sizes: sizes.sizes,
    matchPhrases: item.match_phrases as string[],
    source,
  };
}

/**
 * Reads the seed file (src/lib/data/bikes/seedBikes.json). Every bike is checked on its own: a bike with a problem is left
 * out and named in `errors`, the others are used. The test of the seed requires `errors` to be empty.
 */
export function loadSeedBikes(raw: unknown): SeedLoadResult {
  if (!Array.isArray(raw)) return { bikes: [], errors: ['the seed file must be a list of bikes'] };
  const bikes: StockBikeSpec[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const label = isObject(item) && typeof item.id === 'string' ? item.id : `entry ${index + 1}`;
    const parsed = parseBike(item);
    if (typeof parsed === 'string') return void errors.push(`${label}: ${parsed}`);
    if (seen.has(parsed.id)) return void errors.push(`${label}: the id is used twice`);
    seen.add(parsed.id);
    bikes.push(parsed);
  });
  return { bikes, errors };
}
