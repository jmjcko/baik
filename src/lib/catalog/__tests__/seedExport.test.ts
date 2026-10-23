import { describe, it, expect } from 'vitest';
import { loadSeedBikes } from '@/lib/bikes/seedLoader';
import seed from '@/lib/data/bikes/seedBikes.json';
import type { SizeSpec } from '@/lib/bikes/types';
import { catalogBikeToSeedEntry, groupCatalogBikes, mergeSeedEntry, toSeedFileText } from '../seedExport';
import type { CatalogRow } from '../types';

const spec = (stack: number, reach: number): SizeSpec => ({ frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, topTubeMm: 540, stockStemMm: 90, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: 15 });
const row = (size: string, stack: number, reach: number): CatalogRow => ({
  id: size, brand: 'Cube', model: 'Attain', year: 2027, size, key: `cube-attain-2027-${size}`, spec: spec(stack, reach), origin: 'owner', confirmations: 0, note: null,
});
const OPTIONS = { category: 'road_endurance', sourceUrl: ' https://www.cube.eu/attain ', verifiedOn: '2026-10-23' } as const;

describe('export of the catalog to the seed file', () => {
  it('should group the sizes of one bike, smallest first', () => {
    const bikes = groupCatalogBikes([row('L', 600, 390), row('S', 540, 375), row('M', 570, 382)]);
    expect(bikes).toHaveLength(1);
    expect(bikes[0].id).toBe('cube-attain-2027');
    expect(bikes[0].rows.map((r) => r.size)).toEqual(['S', 'M', 'L']);
  });

  it('should write an entry the loader accepts, with spacers and seatpost offset null', () => {
    const entry = catalogBikeToSeedEntry(groupCatalogBikes([row('M', 570, 382), row('S', 540, 375)])[0], OPTIONS);
    const loaded = loadSeedBikes([entry]);
    expect(loaded.errors).toEqual([]);
    expect(loaded.bikes[0].sizes.M.stockSpacersMm).toBeNull();
    expect(loaded.bikes[0].source.url).toBe('https://www.cube.eu/attain');
    expect(loaded.bikes[0].matchPhrases).toEqual(['cube attain']);
  });

  it('should be refused by the loader without an https address, never written silently', () => {
    const entry = catalogBikeToSeedEntry(groupCatalogBikes([row('M', 570, 382)])[0], { ...OPTIONS, sourceUrl: 'cube.eu' });
    expect(loadSeedBikes([entry]).errors[0]).toContain('https');
  });

  it('should add to the seed file and replace an entry with the same id', () => {
    const entry = catalogBikeToSeedEntry(groupCatalogBikes([row('M', 570, 382)])[0], OPTIONS);
    const once = mergeSeedEntry(seed, entry);
    expect(once).toHaveLength(seed.length + 1);
    expect(mergeSeedEntry(once, entry)).toHaveLength(seed.length + 1);
    expect(loadSeedBikes(once).errors).toEqual([]);
    expect(toSeedFileText(once).endsWith('\n')).toBe(true);
  });
});
