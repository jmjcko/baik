import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { STOCK_BIKE_SPECS, SEED_ERRORS } from '../stockBikeSpecs';
import { loadSeedBikes } from '../seedLoader';

const raw = JSON.parse(readFileSync('src/lib/data/bikes/seedBikes.json', 'utf8')) as Array<{ id: string; source: { url: string; verified_on: string }; sizes: unknown[] }>;

describe('the seed file seedBikes.json', () => {
  it('should pass every check of the loader: no bike is left out', () => {
    expect(SEED_ERRORS).toEqual([]);
    expect(loadSeedBikes(raw).errors).toEqual([]);
    expect(STOCK_BIKE_SPECS).toHaveLength(raw.length);
  });

  it('should give every bike a source address and the day the numbers were read, and every size a row', () => {
    for (const bike of raw) {
      expect(bike.source.url, bike.id).toMatch(/^https:\/\//);
      expect(bike.source.verified_on, bike.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bike.sizes.length, bike.id).toBeGreaterThan(0);
    }
  });

  it('should keep the factory spacers and the seat post offset null for every size (the makers do not publish them)', () => {
    for (const bike of STOCK_BIKE_SPECS) for (const spec of Object.values(bike.sizes)) expect([spec.stockSpacersMm, spec.stockSeatpostOffsetMm], bike.id).toEqual([null, null]);
  });

  it('should hold the four bikes that were checked by hand before the file existed, with their numbers unchanged', () => {
    const table = Object.fromEntries(STOCK_BIKE_SPECS.map((bike) => [bike.id, bike.sizeOrder.map((size) => `${size}:${bike.sizes[size].frameStackMm}/${bike.sizes[size].frameReachMm}/${bike.sizes[size].seatTubeAngleDeg}`)]));
    expect(table['canyon-endurace-cf-8-di2-2024']).toEqual(['XS:548/370/73.5', 'S:568/375/73.5', 'M:590/378/73.5', 'L:611/387/73.5', 'XL:637/405/73.5']);
    expect(table['specialized-tarmac-sl8-expert-2024']).toEqual(['52:527/380/74', '54:544/384/74', '56:565/395/73.5', '58:591/402/73.5']);
    expect(table['trek-domane-sl-6-gen-4-2024']).toEqual(['52:561/371/74.2', '54:575/374/73.7', '56:591/377/73.3', '58:611/380/73']);
    expect(table['giant-defy-advanced-2-2023']).toEqual(['S:546/374/74', 'M:567/377/73.5', 'ML:586/381/73', 'L:605/390/73']);
    const canyon = STOCK_BIKE_SPECS.find((bike) => bike.id === 'canyon-endurace-cf-8-di2-2024')!;
    expect(canyon.sizes.M).toMatchObject({ topTubeMm: 543, headTubeMm: 164, stockStemMm: 100, stockHandlebarMm: 410, stockCrankMm: 172.5 });
    const trek = STOCK_BIKE_SPECS.find((bike) => bike.id === 'trek-domane-sl-6-gen-4-2024')!;
    expect(trek.sizes['54']).toMatchObject({ stockStemMm: 90, stockHandlebarMm: null, stockCrankMm: null });
    expect(canyon).toMatchObject({ category: 'road_endurance', discipline: 'road', years: [2024] });
  });

  it('should be the list that the bike lookup and the picker read', () => {
    expect(STOCK_BIKE_SPECS.map((bike) => bike.id)).toEqual(raw.map((bike) => bike.id));
  });
});
