import { describe, it, expect } from 'vitest';
import { RIDING_DISCIPLINES } from '@/types/baikfit';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';

const CRANKS = [165, 170, 172.5, 175];

describe('stock bike seed (guard for the hand checked data)', () => {
  it('should hold the four models that were checked first, each with its sizes in order', () => {
    const first = STOCK_BIKE_SPECS.slice(0, 4);
    expect(first.map((bike) => `${bike.brand} ${bike.model}`)).toEqual([
      'Canyon Endurace CF 8', 'Specialized Tarmac SL8', 'Trek Domane SL 6 Gen 4', 'Giant Defy Advanced 2',
    ]);
    expect(first.map((bike) => bike.sizeOrder)).toEqual([['XS', 'S', 'M', 'L', 'XL'], ['52', '54', '56', '58'], ['52', '54', '56', '58'], ['S', 'M', 'ML', 'L']]);
  });

  it('should have unique ids and a size entry for exactly the listed sizes', () => {
    expect(new Set(STOCK_BIKE_SPECS.map((bike) => bike.id)).size).toBe(STOCK_BIKE_SPECS.length);
    for (const bike of STOCK_BIKE_SPECS) expect(Object.keys(bike.sizes).sort(), bike.id).toEqual([...bike.sizeOrder].sort());
  });

  it('should name a source, the day it was read, a known discipline and the model years', () => {
    for (const bike of STOCK_BIKE_SPECS) {
      expect(bike.source.url, bike.id).toMatch(/^https:\/\//);
      expect(bike.source.verifiedOn, bike.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bike.source.name.length, bike.id).toBeGreaterThan(5);
      expect(RIDING_DISCIPLINES).toContain(bike.discipline);
      expect(bike.years.length, bike.id).toBeGreaterThan(0);
      for (const year of bike.years) expect(year, bike.id).toBeGreaterThanOrEqual(2022);
    }
  });

  it('should keep every geometry value in a plausible road bike range', () => {
    for (const bike of STOCK_BIKE_SPECS) {
      for (const [size, spec] of Object.entries(bike.sizes)) {
        const where = `${bike.id} ${size}`;
        expect(spec.frameStackMm, where).toBeGreaterThanOrEqual(480);
        expect(spec.frameStackMm, where).toBeLessThanOrEqual(680);
        expect(spec.frameReachMm, where).toBeGreaterThanOrEqual(340);
        expect(spec.frameReachMm, where).toBeLessThanOrEqual(430);
        expect(spec.seatTubeAngleDeg, where).toBeGreaterThanOrEqual(72);
        expect(spec.seatTubeAngleDeg, where).toBeLessThanOrEqual(76);
        if (spec.topTubeMm !== undefined) expect(spec.topTubeMm, where).toBeGreaterThan(480);
        if (spec.headTubeMm !== undefined) expect(spec.headTubeMm, where).toBeGreaterThanOrEqual(85);
      }
    }
  });

  it('should grow from one size to the next in stack and reach', () => {
    for (const bike of STOCK_BIKE_SPECS) {
      const rows = bike.sizeOrder.map((size) => bike.sizes[size]);
      rows.slice(1).forEach((row, index) => {
        expect(row.frameStackMm, bike.id).toBeGreaterThan(rows[index].frameStackMm);
        expect(row.frameReachMm, bike.id).toBeGreaterThan(rows[index].frameReachMm);
      });
    }
  });

  it('should keep every published stock component plausible and leave the unpublished ones null, never guessed', () => {
    for (const bike of STOCK_BIKE_SPECS) {
      for (const spec of Object.values(bike.sizes)) {
        if (spec.stockStemMm !== null) expect(spec.stockStemMm).toBeGreaterThanOrEqual(60);
        if (spec.stockStemMm !== null) expect(spec.stockStemMm).toBeLessThanOrEqual(140);
        if (spec.stockHandlebarMm !== null) expect(spec.stockHandlebarMm).toBeGreaterThanOrEqual(340);
        if (spec.stockHandlebarMm !== null) expect(spec.stockHandlebarMm).toBeLessThanOrEqual(460);
        if (spec.stockCrankMm !== null) expect(CRANKS).toContain(spec.stockCrankMm);
        expect(spec.stockSeatpostOffsetMm).toBeNull();
        expect(spec.stockSpacersMm).toBeNull();
      }
    }
  });

  it('should keep the numbers of the manufacturer tables (spot checks against the sources)', () => {
    const [canyon, tarmac, trek, giant] = STOCK_BIKE_SPECS;
    expect(canyon.sizes.M).toMatchObject({ frameStackMm: 590, frameReachMm: 378, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 410, stockCrankMm: 172.5 });
    expect(tarmac.sizes['56']).toMatchObject({ frameStackMm: 565, frameReachMm: 395, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5 });
    expect(trek.sizes['54']).toMatchObject({ frameStackMm: 575, frameReachMm: 374, seatTubeAngleDeg: 73.7, stockStemMm: 90, stockHandlebarMm: null, stockCrankMm: null });
    expect(giant.sizes.ML).toMatchObject({ frameStackMm: 586, frameReachMm: 381, seatTubeAngleDeg: 73, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5 });
  });

  it('should write the match phrases as normalized lowercase words', () => {
    for (const bike of STOCK_BIKE_SPECS) for (const phrase of bike.matchPhrases) expect(phrase, bike.id).toMatch(/^[a-z0-9]+( [a-z0-9]+)+$/);
  });
});
