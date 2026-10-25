import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { buildTargets } from '../buildTargets';
import type { FindingInput } from '../reportFindings';

const PETR: FindingInput = {
  inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: 751,
  currentBarWidthMm: 420, currentSaddleHeightMm: 720,
};

describe.each(['en', 'cs'] as Locale[])('buildTargets (%s)', (locale) => {
  const t = translations[locale];
  const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'road' });
  const targets = buildTargets(t, PETR, coordinates, 'road');
  const by = (key: string) => targets.find((target) => target.key === key)!;

  it('should list the four targets in the agreed order with their values', () => {
    expect(targets.map((x) => x.key)).toEqual(['saddle', 'handlebar', 'crank', 'setback']);
    expect(targets.map((x) => x.value)).toEqual(['751 mm', '380 mm', '165 mm', `${coordinates.saddle.setbackXMm} mm`]);
  });

  it('should show the saddle formula with the rider input: inseam 850 x 0.883 = 750.55, rounded to 751', () => {
    const origin = by('saddle').origin;
    for (const part of ['850', '0.883', '750.55', '751', '3']) expect(origin).toContain(part);
    expect(origin).not.toMatch(/\{\w+\}/);
  });

  it('should show the handlebar rule: shoulder width 380 x 1:1, commercial widths, result 380', () => {
    const origin = by('handlebar').origin;
    for (const part of ['380', '1:1', '380, 400, 420, 440']) expect(origin).toContain(part);
    expect(by('handlebar').note).toContain('380');
  });

  it('should compare the crank with the KB range and name the 7.5 mm excess, or confirm a crank in range', () => {
    expect(by('crank').origin).toContain('172.5');
    expect(by('crank').origin).toContain('7.5');
    expect(by('crank').origin).toContain('160–165');
    const ok = buildTargets(t, { ...PETR, crankLengthMm: 160 }, coordinates, 'road').find((x) => x.key === 'crank')!;
    expect(ok.value).toBe('160 mm');
    expect(ok.origin).toContain('160');
    expect(ok.origin).not.toContain('7.5');
  });

  it('should mark the setback as an estimate with the discipline ratio and take the pitch limit from the KB', () => {
    const gravel = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'gravel' });
    const setback = buildTargets(t, PETR, gravel, 'gravel').find((x) => x.key === 'setback')!;
    expect(setback.estimate).toBe(true);
    expect(setback.origin).toContain('0.25');
    expect(setback.origin).toContain(String(gravel.saddle.setbackXMm));
    expect(setback.meaning).toContain('2°');
    expect(setback.impact).toContain('2°');
    expect(targets.filter((x) => x.estimate).map((x) => x.key)).toEqual(['setback']);
  });

  it('should explain the health impact only with what the KB supports', () => {
    expect(by('saddle').impact).toMatch(/knee|kolen/i);
    expect(by('handlebar').impact).toMatch(/ulnar|ulnárn/i);
    expect(by('crank').impact).toMatch(/hip|kyčel/i);
    expect(by('setback').impact).toMatch(/hands|rukou/i);
  });
});
