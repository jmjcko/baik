import { describe, it, expect } from 'vitest';
import { FLAT_SCENARIOS } from '../flatRepair';
import { SEALANT_MONTHS, sealantAlert, sealantWindow } from '../sealant';
import { PRESSURE_RANGES, pressureGuide, tyreCategory } from '../tyrePressure';

describe('the tubeless sealant (KB bAIkcare v1.1.0: every 3 to 6 months)', () => {
  const at = '2026-05-01';
  it('should hold the 3 to 6 month window', () => {
    expect(SEALANT_MONTHS).toEqual({ from: 3, until: 6 });
    expect(sealantWindow(at)).toEqual({ from: '2026-08-01', until: '2026-11-01' });
    expect(sealantWindow(null)).toBeNull();
    expect(sealantWindow('not a day')).toBeNull();
  });

  it.each([
    ['2026-07-31', 'fresh'], ['2026-08-01', 'topUp'], ['2026-11-01', 'topUp'], ['2026-11-02', 'overdue'],
  ])('should read the sealant of %s as %s', (today, alert) => {
    expect(sealantAlert({ tubeless: true, sealantAt: at }, today)).toBe(alert);
  });

  it('should ask for the day of a tubeless tyre without one, and say nothing for tubes', () => {
    expect(sealantAlert({ tubeless: true, sealantAt: null }, '2026-10-29')).toBe('unknown');
    expect(sealantAlert({ tubeless: false, sealantAt: at }, '2026-10-29')).toBe('none');
  });
});

describe('the tyre pressure guide', () => {
  it('should hold the three reference ranges of the owner', () => {
    expect(PRESSURE_RANGES).toEqual({ road: { minBar: 5, maxBar: 6.5 }, gravel: { minBar: 2.2, maxBar: 3.2 }, mtb: { minBar: 1.4, maxBar: 1.8 } });
  });

  it('should take the category from the discipline', () => {
    expect(tyreCategory('road')).toBe('road');
    expect(tyreCategory('gravel')).toBe('gravel');
    expect(tyreCategory('xc_mtb')).toBe('mtb');
  });

  it.each([
    ['road', 60, 5], ['road', 100, 6.5], ['road', 80, 5.8], ['road', 75, 5.6], ['gravel', 80, 2.7], ['mtb', 60, 1.4], ['mtb', 100, 1.8],
  ] as const)('should give %s at %s kg about %s bar', (category, kg, bar) => {
    expect(pressureGuide(category, kg).bar).toBe(bar);
  });

  it('should keep a light or a heavy rider inside the range, and use the middle when the weight is unknown', () => {
    expect(pressureGuide('road', 40).bar).toBe(5);
    expect(pressureGuide('road', 140).bar).toBe(6.5);
    expect(pressureGuide('road', null).bar).toBe(5.8);
    expect(pressureGuide('road', Number.NaN).bar).toBe(5.8);
  });
});

describe('the flat repair jobs', () => {
  it('should hold the five jobs in the order of the owner', () => {
    expect(FLAT_SCENARIOS).toEqual(['tube', 'patch', 'plug', 'sealant', 'tape']);
  });
});
