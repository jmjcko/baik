import { describe, it, expect } from 'vitest';
import type { BikeShare } from '@/lib/catalog/types';
import { bikeOfSizes, parseSuppliedBike, sharesOfSupplied, suppliedFromShares } from '../suppliedBike';
import type { SizeSpec } from '../types';

const spec = (stack: number, reach: number, over: Partial<SizeSpec> = {}): SizeSpec => ({ frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null, ...over });
const share = (size: string, stack: number, reach: number, over: Partial<BikeShare> = {}): BikeShare => ({ brand: 'Canyon', model: 'Endurace CF 8', year: 2025, size, spec: spec(stack, reach), ...over });

describe('suppliedFromShares', () => {
  it('should make one bike of the reviewed sizes, from the smallest', () => {
    const bike = suppliedFromShares([share('L', 590, 395), share('S', 540, 372), share('M', 570, 385)]);
    expect(bike).toMatchObject({ brand: 'Canyon', model: 'Endurace CF 8', year: 2025 });
    expect(bike?.sizes.map((row) => row.size)).toEqual(['S', 'M', 'L']);
  });

  it('should return null for nothing, and for sizes that belong to different bikes', () => {
    expect(suppliedFromShares([])).toBeNull();
    expect(suppliedFromShares([share('S', 540, 372), share('M', 570, 385, { model: 'Other' })])).toBeNull();
  });

  it('should give the shares back, one per size, for sharing', () => {
    const bike = suppliedFromShares([share('S', 540, 372), share('M', 570, 385)])!;
    expect(sharesOfSupplied(bike)).toEqual([share('S', 540, 372), share('M', 570, 385)]);
  });
});

describe('parseSuppliedBike', () => {
  const stored = { brand: 'Canyon', model: 'Endurace', year: 2025, sizes: [{ size: 'M', spec: spec(570, 385) }, { size: 'S', spec: spec(540, 372) }] };

  it('should read a stored bike back with its sizes in order', () => {
    expect(parseSuppliedBike(stored)?.sizes.map((row) => row.size)).toEqual(['S', 'M']);
  });

  it('should drop a damaged size, a size twice, a label with markup and a number out of range, but keep the rest', () => {
    const damaged = { ...stored, sizes: [...stored.sizes, { size: 'M', spec: spec(571, 386) }, { size: '<b>', spec: spec(600, 400) }, { size: 'XL', spec: spec(9999, 400) }, { size: 'L', spec: 'x' }, null] };
    expect(parseSuppliedBike(damaged)?.sizes.map((row) => row.size)).toEqual(['S', 'M']);
  });

  it.each([
    ['nothing', undefined],
    ['a bike without a name', { ...stored, brand: '' }],
    ['a year that is not plausible', { ...stored, year: 1850 }],
    ['sizes that are not a list', { ...stored, sizes: 'M' }],
    ['no usable size', { ...stored, sizes: [{ size: 'M', spec: spec(1, 1) }] }],
  ])('should refuse %s', (_name, raw) => {
    expect(parseSuppliedBike(raw)).toBeNull();
  });
});

describe('bikeOfSizes', () => {
  it('should make a bike of the app that is ranked like a bike of the catalog', () => {
    const bike = bikeOfSizes('x', { brand: 'A', model: 'B', year: 2025, sizes: [{ size: 'L', spec: spec(590, 395) }, { size: 'S', spec: spec(540, 372) }] }, 'gravel');
    expect(bike).toMatchObject({ id: 'x', discipline: 'gravel', sizeOrder: ['S', 'L'], years: [2025], matchPhrases: [] });
    expect(bike.sizes.S.frameStackMm).toBe(540);
  });
});
