import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '../stockBikeSpecs';
import { WANTED_BIKES, knownYears, seedKnown } from '../missingBikes';

const find = (id: string) => WANTED_BIKES.find((bike) => bike.id === id)!;

describe('wanted bikes of the missing queue', () => {
  it('should list the ten key models without a year, with an https site of the maker and unique ids', () => {
    expect(WANTED_BIKES).toHaveLength(10);
    expect(new Set(WANTED_BIKES.map((bike) => bike.id)).size).toBe(10);
    expect(WANTED_BIKES.every((bike) => /^https:\/\/www\.[a-z-]+\.[a-z]+$/.test(bike.siteUrl) && !/\d{4}/.test(`${bike.id}${bike.model}`))).toBe(true);
  });

  it('should show the years of a model that the seed has under a longer model name', () => {
    const seed = seedKnown(STOCK_BIKE_SPECS);
    expect(knownYears(find('specialized-tarmac-sl8'), seed)).toEqual([2026, 2024]);
    expect(knownYears(find('trek-domane-sl'), seed)).toEqual([2024]);
    expect(knownYears(find('giant-defy-advanced'), seed)).toEqual([2023]);
    expect(knownYears(find('orbea-orca'), seed)).toEqual([]);
  });

  it('should list the years of the catalog newest first and without repeats', () => {
    const catalog = [2025, 2027, 2025].map((year) => ({ brand: 'Cube', model: 'Attain Pro', year }));
    expect(knownYears(find('cube-attain'), catalog)).toEqual([2027, 2025]);
  });
});
