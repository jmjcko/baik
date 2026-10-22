import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { buildActionPlan } from '../buildActionPlan';
import type { FindingInput } from '../reportFindings';

const BASE: FindingInput = {
  inseamMm: 840, acromionWidthMm: 390, crankLengthMm: 165, riderWeightKg: 75, saddleHeightMm: 742,
  currentBarWidthMm: 380, currentSaddleHeightMm: 742,
};

describe.each(['en', 'cs'] as Locale[])('buildActionPlan (%s)', (locale) => {
  const t = translations[locale];

  it('should always end with saddle pitch and cleats built from the KB values', () => {
    const steps = buildActionPlan(t, BASE);
    expect(steps.map((s) => s.id)).toEqual(['saddle', 'pitchCleat']);
    expect(steps[1].body).toContain('10');
    expect(steps[1].body).toContain('17');
    expect(steps[1].body).toContain('2°');
  });

  it('should list saddle, handlebar, crank and pitch in the fixed order when all apply', () => {
    const steps = buildActionPlan(t, { ...BASE, currentBarWidthMm: 440, crankLengthMm: 172.5, riderWeightKg: 95, currentSaddleHeightMm: 726 });
    expect(steps.map((s) => s.id)).toEqual(['saddle', 'handlebar', 'crank', 'pitchCleat']);
    expect(steps[0].body).toContain('16');
    expect(steps[0].body).toContain('3–5');
    expect(steps[1].body).toContain('440');
    expect(steps[1].body).toContain('380');
    expect(steps[2].body).toContain('172.5');
  });

  it('should lower in the KB increments when the saddle is too high and keep it when on target', () => {
    expect(buildActionPlan(t, { ...BASE, currentSaddleHeightMm: 760 })[0].body).toMatch(/18/);
    expect(buildActionPlan(t, { ...BASE, currentSaddleHeightMm: 760 })[0].body).toContain('5–10');
    expect(buildActionPlan(t, BASE)[0].body).toContain('3');
  });

  it('should give the target and a pointer to the wizard when no current values were entered', () => {
    const [saddle] = buildActionPlan(t, { ...BASE, currentSaddleHeightMm: null });
    expect(saddle.body).toContain('742');
  });

  it('should assume the 420 mm factory bar when none was entered and flag it for a narrow rider', () => {
    const steps = buildActionPlan(t, { ...BASE, currentBarWidthMm: null });
    expect(steps.find((s) => s.id === 'handlebar')?.body).toContain('420');
  });
});
