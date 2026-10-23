import seed from '@/lib/data/bikes/seedBikes.json';
import { loadSeedBikes } from './seedLoader';
import type { StockBikeSpec } from './types';

/**
 * Series bikes with the published geometry and stock components of every size, read from `src/lib/data/bikes/seedBikes.json`
 * (schema and rules: docs/data/seed-bikes.md). Every bike names its source and the day the numbers were read; a number that
 * the manufacturer does not publish is `null`, never an estimate. The factory spacer height and the seat post offset are
 * `null` for every bike (the makers do not publish them; the audit then uses the estimates of the KB).
 */
const loaded = loadSeedBikes(seed);

/** Problems of the seed file; empty while the file is right (a test requires it). A bike with a problem is not offered. */
export const SEED_ERRORS: readonly string[] = loaded.errors;

export const STOCK_BIKE_SPECS: readonly StockBikeSpec[] = loaded.bikes;
