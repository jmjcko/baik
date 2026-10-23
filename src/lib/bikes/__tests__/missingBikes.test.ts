import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';
import { WANTED_BIKES, seedKnown, wantedStatus } from '../missingBikes';

const find = (id: string) => WANTED_BIKES.find((bike) => bike.id === id)!;

describe('wanted bikes of the missing queue', () => {
  it('should list the ten key models with an https site of the maker and unique ids', () => {
    expect(WANTED_BIKES).toHaveLength(10);
    expect(new Set(WANTED_BIKES.map((bike) => bike.id)).size).toBe(10);
    expect(WANTED_BIKES.every((bike) => /^https:\/\/www\.[a-z-]+\.[a-z]+$/.test(bike.siteUrl))).toBe(true);
  });

  it('should recognise a bike that the seed has under a longer model name, and the same year only', () => {
    const seed = seedKnown(STOCK_BIKE_SPECS);
    expect(wantedStatus(find('specialized-tarmac-sl8-2024'), seed, [])).toBe('inSeed');
    expect(wantedStatus(find('trek-domane-sl-2024'), seed, [])).toBe('inSeed');
    expect(wantedStatus(find('giant-defy-advanced-2024'), seed, [])).toBe('missing');
  });

  it('should recognise a bike that the catalog has', () => {
    expect(wantedStatus(find('cube-attain-2025'), [], [{ brand: 'Cube', model: 'Attain Pro', year: 2025 }])).toBe('inCatalog');
    expect(wantedStatus(find('cube-attain-2025'), [], [{ brand: 'Cube', model: 'Attain', year: 2024 }])).toBe('missing');
  });
});
