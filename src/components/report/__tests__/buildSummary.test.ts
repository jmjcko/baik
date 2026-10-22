import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { buildSummary, type SummaryInput } from '../buildSummary';

const base = (overrides: Partial<SummaryInput> = {}): SummaryInput => {
  const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'road' });
  return {
    inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: coordinates.saddle.heightAlongTubeMm,
    currentBarWidthMm: 420, currentSaddleHeightMm: 720, heightCm: 181, torsoLengthMm: 610, armLengthMm: 660,
    riderWeightKg: 75, discipline: 'road', coordinates, ...overrides,
  };
};

describe.each(['en', 'cs'] as Locale[])('buildSummary (%s)', (locale) => {
  const t = translations[locale];
  const s = t.diagnosticReport.summary;
  const row = (rows: ReturnType<typeof buildSummary>['setup'], key: string) => rows.find((r) => r.key === key)!;

  it('should list the measurements of the rider with their units', () => {
    const { measures } = buildSummary(t, base());
    expect(measures.map((m) => m.label)).toEqual([s.discipline, s.inseam, s.shoulders, s.torso, s.arm, s.height, s.weight]);
    expect(measures.map((m) => m.value)).toEqual([t.studio.disciplines.road, '850 mm', '380 mm', '610 mm', '660 mm', '181 cm', '75 kg']);
  });

  it('should leave out the torso, arm and height when the profile does not have them', () => {
    const { measures } = buildSummary(t, base({ torsoLengthMm: undefined, armLengthMm: undefined, heightCm: undefined }));
    expect(measures).toHaveLength(4);
  });

  it('should show now, target and the signed change for the saddle, the bar and the crank', () => {
    const { setup } = buildSummary(t, base());
    expect(row(setup, 'saddle')).toMatchObject({ now: '720 mm', target: '751 mm', change: '+31 mm' });
    expect(row(setup, 'handlebar')).toMatchObject({ now: '420 mm', target: '380 mm', change: '−40 mm' });
    expect(row(setup, 'crank')).toMatchObject({ now: '172.5 mm', target: '160–165 mm', change: '−7.5 mm' });
  });

  it('should lower a saddle that is too high and say OK when everything is on target', () => {
    expect(row(buildSummary(t, base({ currentSaddleHeightMm: 760 })).setup, 'saddle').change).toBe('−9 mm');
    const ok = buildSummary(t, base({ currentSaddleHeightMm: 751, currentBarWidthMm: 380, crankLengthMm: 165 })).setup;
    for (const key of ['saddle', 'handlebar', 'crank']) expect(row(ok, key).change, key).toBe(s.ok);
  });

  it('should not invent current values that the rider did not enter', () => {
    const { setup } = buildSummary(t, base({ currentSaddleHeightMm: null, currentBarWidthMm: null }));
    expect(row(setup, 'saddle')).toMatchObject({ now: '–', change: '–' });
    expect(row(setup, 'handlebar')).toMatchObject({ now: '–', change: '–', target: '380 mm' });
  });

  it('should give the pitch and the cleats as KB targets and mark setback, stack and reach as estimates', () => {
    const { setup } = buildSummary(t, base());
    expect(row(setup, 'pitch').target).toContain('2°');
    expect(row(setup, 'cleat').target).toContain('10–17 mm');
    for (const key of ['setback', 'stack', 'reach']) expect(row(setup, key)).toMatchObject({ estimate: true, change: t.diagnosticReport.estimateChip });
    expect(row(setup, 'saddle').estimate).toBe(false);
    expect(setup.map((r) => r.key)).toEqual(['saddle', 'pitch', 'handlebar', 'crank', 'cleat', 'setback', 'stack', 'reach']);
  });
});
