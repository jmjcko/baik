import { describe, it, expect } from 'vitest';
import { ANATOMY_LIMITS, parsePassport } from '../parse';

const valid = () => ({
  discipline: 'road',
  postureStyle: 'balanced',
  anatomy: { inseamMm: 850, acromionWidthMm: 380, torsoLengthMm: 610, armLengthMm: 660, heightCm: 181, weightKg: 75 },
  symptoms: ['numb_hands', 'front_knee'],
  targets: null,
  bikes: [{ id: 'current', kind: 'current', components: { saddleHeightMm: 720, handlebarWidthMm: null, crankLengthMm: 172.5 } }],
  gear: {},
});

describe('parsePassport', () => {
  it('should accept a complete passport as it is', () => {
    expect(parsePassport(valid())).toEqual({
      ...valid(),
      bikes: [{ id: 'current', kind: 'current', components: { saddleHeightMm: 720, handlebarWidthMm: null, crankLengthMm: 172.5 } }],
      activeBikeId: 'current',
    });
  });

  it.each([null, undefined, 'x', 42, [], {}])('should refuse %j', (raw) => {
    expect(parsePassport(raw)).toBeNull();
  });

  it('should refuse an unknown discipline or posture style (the values of the app only)', () => {
    expect(parsePassport({ ...valid(), discipline: 'xc' })).toBeNull();
    expect(parsePassport({ ...valid(), discipline: 'unicycle' })).toBeNull();
    expect(parsePassport({ ...valid(), postureStyle: 'aggressive' })).toBeNull();
    for (const discipline of ['road', 'gravel', 'xc_mtb']) expect(parsePassport({ ...valid(), discipline })?.discipline).toBe(discipline);
    expect(parsePassport({ ...valid(), discipline: 'trekking' })?.discipline).toBe('gravel');
  });

  it.each(Object.keys(valid().anatomy))('should refuse a passport without a plausible %s', (key) => {
    const anatomy = { ...valid().anatomy } as Record<string, unknown>;
    delete anatomy[key];
    expect(parsePassport({ ...valid(), anatomy })).toBeNull();
    const [min, max] = ANATOMY_LIMITS[key as keyof typeof ANATOMY_LIMITS];
    expect(parsePassport({ ...valid(), anatomy: { ...anatomy, [key]: min - 1 } })).toBeNull();
    expect(parsePassport({ ...valid(), anatomy: { ...anatomy, [key]: max + 1 } })).toBeNull();
    expect(parsePassport({ ...valid(), anatomy: { ...anatomy, [key]: Number.NaN } })).toBeNull();
    expect(parsePassport({ ...valid(), anatomy: { ...anatomy, [key]: '850' } })).toBeNull();
  });

  it('should keep plausible optional measurements and drop implausible ones', () => {
    const anatomy = { ...valid().anatomy, footLengthMm: 270, footWidthMm: 5, chestCircumferenceCm: 98, waistCircumferenceCm: 900 };
    expect(parsePassport({ ...valid(), anatomy })?.anatomy).toEqual({ ...valid().anatomy, footLengthMm: 270, chestCircumferenceCm: 98 });
  });

  it('should keep only known symptoms, once each, in the order of the app', () => {
    expect(parsePassport({ ...valid(), symptoms: ['saddle_sores', 'x', 'numb_hands', 'numb_hands'] })?.symptoms).toEqual(['numb_hands', 'saddle_sores']);
    expect(parsePassport({ ...valid(), symptoms: 'numb_hands' })?.symptoms).toEqual([]);
  });

  it('should drop bikes that are not well formed and limit their number', () => {
    const bikes = [{ id: 'a', kind: 'candidate', name: 'N'.repeat(200), frame: { stackMm: 570, reachMm: -5 } }, { id: '', kind: 'current' }, { id: 'b', kind: 'other' }, 'x', null];
    const parsed = parsePassport({ ...valid(), bikes })?.bikes;
    expect(parsed).toHaveLength(1);
    expect(parsed?.[0].name).toHaveLength(80);
    expect(parsed?.[0].frame).toEqual({ stackMm: 570, reachMm: undefined });
    const many = Array.from({ length: 50 }, (_, i) => ({ id: `b${i}`, kind: 'candidate' }));
    expect(parsePassport({ ...valid(), bikes: many })?.bikes).toHaveLength(20);
  });

  it('should keep a well formed targets snapshot and drop a malformed one', () => {
    const targets = {
      saddleHeightMm: 751, saddleSetbackMm: -213, saddlePitchDeg: 2, cockpitStackMm: 574, cockpitReachMm: 388,
      handlebarWidthMm: 380, crankLengthMm: 165, cleatSetbackMm: { min: 10, max: 17 }, kbVersion: '1.1.0',
    };
    expect(parsePassport({ ...valid(), targets })?.targets).toEqual(targets);
    expect(parsePassport({ ...valid(), targets: { ...targets, saddleHeightMm: 'x' } })?.targets).toBeNull();
    expect(parsePassport({ ...valid(), targets: { ...targets, cleatSetbackMm: 10 } })?.targets).toBeNull();
    expect(parsePassport({ ...valid(), targets: 'x' })?.targets).toBeNull();
  });

  it('should replace a malformed gear by an empty object and refuse an oversized document', () => {
    expect(parsePassport({ ...valid(), gear: [1, 2] })?.gear).toEqual({});
    expect(parsePassport({ ...valid(), gear: { jersey: 'M' } })?.gear).toEqual({ jersey: 'M' });
    expect(parsePassport({ ...valid(), gear: { blob: 'x'.repeat(25_000) } })).toBeNull();
  });
});
