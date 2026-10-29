import { describe, it, expect } from 'vitest';
import { findStockBike } from '../lookup';
import type { StockBikeSpec } from '../types';

const idOf = (text: string) => findStockBike(text)?.bike.id ?? null;

describe('findStockBike', () => {
  it('should find a catalog bike whose model ends in letters when the model year follows (BUG-014)', () => {
    const spec = { topTubeMm: 520, headTubeMm: 120, stockStemMm: null, frameReachMm: 378, frameStackMm: 531, stockCrankMm: null, stockSpacersMm: null, seatTubeAngleDeg: 75, stockHandlebarMm: null, stockSeatpostOffsetMm: null };
    const bike = { id: 'community-garda', brand: 'Wilier Triestina', model: 'Garda', build: '', years: [2026], discipline: 'road', sizeOrder: ['S'], sizes: { S: spec }, matchPhrases: [], source: { name: 'Community catalog', url: '', verifiedOn: '' } } as unknown as StockBikeSpec;
    expect(findStockBike('Wilier Triestina Garda 2026', [bike])?.bike.id).toBe('community-garda');
    expect(findStockBike('Wilier Triestina Garda', [bike])?.bike.id).toBe('community-garda');
    expect(findStockBike('Wilier Triestina Garda Pro 2026', [bike])).toBeNull();
  });

  it.each([
    ['Canyon Endurace CF 8', 'canyon-endurace-cf-8-di2-2024'],
    ['canyon endurace cf 8 di2', 'canyon-endurace-cf-8-di2-2024'],
    ['Canyon Endurace CF 8 2024', 'canyon-endurace-cf-8-di2-2024'],
    ['Specialized Tarmac SL8 Expert', 'specialized-tarmac-sl8-expert-2024'],
    ['Specialized Tarmac SL8', 'specialized-tarmac-sl8-2026'],
    ['Trek Domane SL 6 Gen 4', 'trek-domane-sl-6-gen-4-2024'],
    ['trek domane SL6 gen4', 'trek-domane-sl-6-gen-4-2024'],
    ['Giant Defy Advanced 2', 'giant-defy-advanced-2-2023'],
  ])('should find %s', (text, id) => {
    expect(idOf(text)).toBe(id);
  });

  it('should read the size named before or after the bike, with or without "Size" and "cm"', () => {
    expect(findStockBike('Canyon Endurace CF 8 Size M')?.size).toBe('M');
    expect(findStockBike('Canyon Endurace CF 8 xl')?.size).toBe('XL');
    expect(findStockBike('Trek Domane SL 6 Gen 4 54cm')?.size).toBe('54');
    expect(findStockBike('56 Specialized Tarmac SL8 Expert')?.size).toBe('56');
    expect(findStockBike('Giant Defy Advanced 2 ML')?.size).toBe('ML');
    expect(findStockBike('Giant Defy Advanced 2 L')?.size).toBe('L');
  });

  it('should return no size when none is named, and not mistake the letters of a word for one', () => {
    expect(findStockBike('Canyon Endurace CF 8')?.size).toBeNull();
    expect(findStockBike('Trek Domane SL 6 Gen 4')?.size).toBeNull();
  });

  it.each([
    ['Canyon Endurace CF 7'],
    ['Canyon Endurace CF 8.0'],
    ['Canyon Endurace CF 8 AXS'],
    ['Canyon Endurace CF SLX 8'],
    ['Specialized Tarmac SL8 Comp'],
    ['Trek Domane SL 6 Gen 3'],
    ['Trek Domane SL 6'],
    ['Giant Defy Advanced'],
    ['Giant Defy Advanced Pro 1'],
    ['Cannondale Synapse'],
    [''],
  ])('should not match %s (another build, year or bike: the AI extraction takes over)', (text) => {
    expect(findStockBike(text)).toBeNull();
  });

  it('should ignore accents and punctuation', () => {
    expect(idOf('CANYON, Endurace-CF 8!')).toBe('canyon-endurace-cf-8-di2-2024');
  });
});
