import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { agreementOf, groupSubmissions } from '../groups';
import type { SubmissionRow } from '../types';

const spec = STOCK_BIKE_SPECS[0].sizes.M;
const sub = (id: string, userId: string | null, over: Partial<SubmissionRow> = {}): SubmissionRow => ({
  id, userId, brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'cube|attain|2024|54', spec, status: 'pending', catalogId: null, reviewNote: null, createdAt: '2026-10-23T10:00:00Z', ...over,
});

describe('agreementOf', () => {
  it('should count the riders with the same stack, reach and angle', () => {
    expect(agreementOf([sub('1', 'a'), sub('2', 'b'), sub('3', 'c', { spec: { ...spec, frameStackMm: 600 } })])).toBe(2);
  });

  it('should count a rider once, also with two submissions, and an anonymous submission as one rider each', () => {
    expect(agreementOf([sub('1', 'a'), sub('2', 'a')])).toBe(1);
    expect(agreementOf([sub('1', null), sub('2', null)])).toBe(2);
    expect(agreementOf([])).toBe(0);
  });

  it('should ignore the stock parts: riders may fill in different parts', () => {
    expect(agreementOf([sub('1', 'a'), sub('2', 'b', { spec: { ...spec, stockStemMm: 90 } })])).toBe(2);
  });
});

describe('groupSubmissions', () => {
  it('should group by bike size with a label, the riders and the agreement', () => {
    const groups = groupSubmissions([sub('1', 'a'), sub('2', 'b'), sub('3', 'c', { size: '56', key: 'cube|attain|2024|56' })]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ key: 'cube|attain|2024|54', label: 'Cube Attain 2024, 54', riders: 2, agreeing: 2 });
    expect(groups[0].items.map((i) => i.id)).toEqual(['1', '2']);
    expect(groups[1]).toMatchObject({ riders: 1, agreeing: 1 });
  });

  it('should put the groups with the most riders first, then by name', () => {
    const groups = groupSubmissions([sub('1', 'a', { brand: 'Zed', key: 'z' }), sub('2', 'a', { brand: 'Abc', key: 'a' }), sub('3', 'b', { key: 'cube|attain|2024|54' }), sub('4', 'c', { key: 'cube|attain|2024|54' })]);
    expect(groups.map((g) => g.label)).toEqual(['Cube Attain 2024, 54', 'Abc Attain 2024, 54', 'Zed Attain 2024, 54']);
  });

  it('should give nothing for nothing', () => {
    expect(groupSubmissions([])).toEqual([]);
  });
});
