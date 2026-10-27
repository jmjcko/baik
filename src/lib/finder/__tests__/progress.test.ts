import { describe, it, expect } from 'vitest';
import { PROGRESS_KEY, PROGRESS_VERSION, candidateKey, clearProgress, emptyProgress, loadProgress, parseProgress, saveProgress, type FinderProgress } from '../progress';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';

const row = (size: string, stack: number, reach: number) => ({ size, spec: { frameStackMm: stack, frameReachMm: reach, seatTubeAngleDeg: 73.5, stockStemMm: null, stockHandlebarMm: null, stockCrankMm: null, stockSeatpostOffsetMm: null, stockSpacersMm: null } });
const table: SuppliedBike = { brand: 'Canyon', model: 'Endurace CF 8', year: 2025, sizes: [row('S', 540, 372), row('M', 570, 385)] };
const candidates = [
  { brand: 'Canyon', model: 'Endurace CF 8', year: 2025, reason: 'Comfortable.' },
  { brand: 'Trek', model: 'Domane SL 6', year: 2025, reason: 'Relaxed.' },
];
const saved = (): FinderProgress => ({ ...emptyProgress('road'), answers: { shifting: ['electronic'] }, step: 3, candidates, tables: { [candidateKey(candidates[0])]: table } });

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { data, getItem: (key: string) => data[key] ?? null, setItem: (key: string, value: string) => { data[key] = value; }, removeItem: (key: string) => { delete data[key]; } };
}

describe('the progress of the finder', () => {
  it('should be kept and read back unchanged, with the table that the rider supplied', () => {
    const store = memory();
    saveProgress(saved(), store);
    expect(Object.keys(store.data)).toEqual([PROGRESS_KEY]);
    const back = loadProgress(store);
    expect(back).toMatchObject({ category: 'road', step: 3, answers: { shifting: ['electronic'] }, candidates });
    expect(back?.tables[candidateKey(candidates[0])].sizes.map((s) => s.size)).toEqual(['S', 'M']);
  });

  it('should be forgotten on a new start', () => {
    const store = memory();
    saveProgress(saved(), store);
    clearProgress(store);
    expect(loadProgress(store)).toBeNull();
  });

  it.each([
    ['nothing stored', undefined],
    ['text that is not JSON', 'not json'],
    ['another version', JSON.stringify({ ...saved(), version: PROGRESS_VERSION + 1 })],
    ['an unknown kind of bike', JSON.stringify({ ...saved(), category: 'ebike' })],
  ])('should read %s as no progress', (_name, text) => {
    expect(loadProgress(memory(text === undefined ? {} : { [PROGRESS_KEY]: text }))).toBeNull();
  });

  it('should check a stored value as a new one: unknown answers, a damaged candidate, a table of nobody and too many candidates are dropped', () => {
    const many = [1, 2, 3, 4, 5].map((n) => ({ ...candidates[0], model: `Model ${n}` }));
    const tampered = { ...saved(), answers: { shifting: ['telepathic'], mounts: ['bags'] }, candidates: [...many, { brand: '<b>', model: '', year: 1, reason: '' }], tables: { 'unknown|key|0': table, [candidateKey(many[0])]: { brand: 'x', model: 'y', year: 2025, sizes: [{ size: 'S', spec: { frameStackMm: 1 } }] } }, step: 99 };
    const back = parseProgress(tampered)!;
    expect(back.answers).toEqual({ mounts: ['bags'] });
    expect(back.candidates).toHaveLength(3);
    expect(back.tables).toEqual({});
    expect(back.step).toBe(12);
  });

  it('should survive a storage that throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); }, removeItem: () => { throw new Error('blocked'); } };
    expect(loadProgress(broken)).toBeNull();
    expect(() => saveProgress(saved(), broken)).not.toThrow();
    expect(() => clearProgress(broken)).not.toThrow();
  });

  it('should key a candidate by brand, model and year, ignoring spaces and case', () => {
    expect(candidateKey({ brand: 'Canyon', model: 'Endurace CF 8', year: 2025 })).toBe(candidateKey({ brand: 'canyon', model: 'ENDURACE-CF 8', year: 2025 }));
  });
});
