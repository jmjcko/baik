import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';
import { auditGeometryOf, geometryOfBike, nameOfBike, searchBikes, suggestBikes } from '../auditGeometry';

const canyon = STOCK_BIKE_SPECS.find((bike) => bike.id === 'canyon-endurace-cf-8-di2-2024')!;
const spec = { frameStackMm: 570, frameReachMm: 385, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null };
const bike: SuppliedBike = { brand: 'Acme', model: 'Flyer X', year: 2025, sizes: [{ size: 'M', spec }] };

describe('geometryOfBike', () => {
  it('should list every size of a catalog bike with its numbers, from the smallest', () => {
    const result = geometryOfBike(canyon);
    expect(result.geometry.source).toBe('catalog');
    expect(result.sizes).toEqual([...canyon.sizeOrder]);
    expect(result.label).toBe('Canyon Endurace CF 8 2024');
  });
});

describe('auditGeometryOf', () => {
  it('should find the typed bike in the catalog first, also in a longer text and in the community catalog', () => {
    expect(auditGeometryOf('Canyon Endurace CF 8 2024 size M', STOCK_BIKE_SPECS, null)?.geometry.source).toBe('catalog');
    const community = { ...canyon, id: 'community-x', brand: 'Brand Co', model: 'Speed 5', matchPhrases: [] };
    expect(auditGeometryOf('brand co speed 5', [community], null)?.label).toContain('Brand Co Speed 5');
  });

  it('should use the table that the rider supplied for this very name, and no other', () => {
    const supplied = { name: 'Acme Flyer X', bike };
    expect(auditGeometryOf(' acme flyer x ', [], supplied)).toMatchObject({ geometry: { source: 'rider' }, label: 'Acme Flyer X 2025', sizes: ['M'] });
    expect(auditGeometryOf('Acme Flyer Y', [], supplied)).toBeNull();
  });

  it('should return null for a bike that is nowhere: the audit does not run without geometry', () => {
    expect(auditGeometryOf('Nobody Nothing', [], null)).toBeNull();
    expect(auditGeometryOf('', [], null)).toBeNull();
  });

  it('should not take another build for the bike of the catalog', () => {
    expect(auditGeometryOf('Canyon Endurace CF 7', STOCK_BIKE_SPECS, null)).toBeNull();
  });
});

describe('suggestBikes', () => {
  const superior = STOCK_BIKE_SPECS.find((bike) => bike.model.includes('X-Road'));

  it('should suggest the bike of the catalog when a build word is missing from the typed name', () => {
    expect(superior).toBeDefined();
    expect(suggestBikes('Superior X-Road Team Elite', STOCK_BIKE_SPECS).map((bike) => bike.id)).toContain(superior!.id);
  });

  it('should suggest nothing for an exact name, a single word or an unrelated bike', () => {
    expect(suggestBikes('Canyon Endurace CF 8 2024', STOCK_BIKE_SPECS)).toEqual([]);
    expect(suggestBikes('Canyon', STOCK_BIKE_SPECS)).toEqual([]);
    expect(suggestBikes('Acme Flyer X', STOCK_BIKE_SPECS)).toEqual([]);
  });

  it('should suggest at most three bikes, the closest first, and name a bike the way it is typed', () => {
    expect(suggestBikes('Canyon Endurace', STOCK_BIKE_SPECS).length).toBeLessThanOrEqual(3);
    expect(nameOfBike(canyon)).toBe('Canyon Endurace CF 8 2024');
  });
});

describe('searchBikes', () => {
  it('should match every typed word as the start of a word of the brand, the model or the year, the last word unfinished', () => {
    expect(searchBikes('can end', STOCK_BIKE_SPECS).map(nameOfBike)).toContain('Canyon Endurace CF 8 2024');
    expect(searchBikes('trek dom 2024', STOCK_BIKE_SPECS).map(nameOfBike)).toEqual(['Trek Domane SL 6 Gen 4 2024']);
  });

  it('should return nothing for an empty text, and at most the limit', () => {
    expect(searchBikes('', STOCK_BIKE_SPECS)).toEqual([]);
    expect(searchBikes('   ', STOCK_BIKE_SPECS)).toEqual([]);
    expect(searchBikes('c', STOCK_BIKE_SPECS, 3).length).toBeLessThanOrEqual(3);
  });

  it('should fall back to the near match when no bike has all the typed words', () => {
    expect(searchBikes('Superior X-Road Team Elite', STOCK_BIKE_SPECS).map(nameOfBike).join(' ')).toContain('X-Road Team Elite Di2');
    expect(searchBikes('Zzyzx Qwerty', STOCK_BIKE_SPECS)).toEqual([]);
  });
});
