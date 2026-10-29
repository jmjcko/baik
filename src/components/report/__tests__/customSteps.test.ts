import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { buildActionPlan } from '../buildActionPlan';
import type { FindingInput } from '../reportFindings';

const custom = { saddleSetbackMm: 180, stemLengthMm: 110, spacerStackMm: 10, saddleToBarDropMm: 90 };
const BASE: FindingInput = {
  inseamMm: 840, acromionWidthMm: 390, crankLengthMm: 165, saddleHeightMm: 742, currentBarWidthMm: 380, currentSaddleHeightMm: 730,
  setupMode: 'custom', custom, setbackTargetMm: 195,
};

describe.each(['en', 'cs'] as Locale[])('the plan of a modified bike (%s)', (locale) => {
  const t = translations[locale];
  const plan = (input: Partial<FindingInput> = {}) => buildActionPlan(t, { ...BASE, ...input });

  it('should compare the measured saddle height and setback with the targets and name the millimetres (730 against 742, 180 against 195)', () => {
    const steps = plan();
    expect(steps.map((s) => s.id)).toEqual(['saddle', 'setback', 'pitch', 'cleat']);
    expect(steps[0].body).toContain('12');
    expect(steps[1].body).toContain('180');
    expect(steps[1].body).toContain('195');
    expect(steps[1].body).toContain('15');
    expect(steps[1].body).toContain(t.customSetup.plan.estimate);
    expect(steps[1].reason).toBe(t.customSetup.reasons.setback);
  });

  it('should leave the measured numbers out for a series bike and when nothing was measured', () => {
    expect(plan({ setupMode: 'stock' }).map((s) => s.id)).not.toContain('setback');
    expect(plan({ custom: { ...custom, saddleSetbackMm: null } }).map((s) => s.id)).not.toContain('setback');
  });

  it('should never advise moving the saddle forward for numb hands', () => {
    const steps = plan({ currentPains: ['numb_hands'], custom: { ...custom, saddleSetbackMm: 215 } });
    expect(steps.map((s) => s.id)).not.toContain('setback');
  });

  it('should shorten a long mountain bike stem to the KB maximum', () => {
    const steps = plan({ discipline: 'xc_mtb', custom: { ...custom, stemLengthMm: 70 } });
    const reach = steps.find((s) => s.id === 'reach');
    expect(reach?.body).toContain('70');
    expect(reach?.body).toContain('20');
    expect(reach?.body).toContain('50');
  });

  it('should put the measured stem, drop and spacers into the steps of a rider with numb hands, and never lower the bars', () => {
    const steps = plan({ currentPains: ['numb_hands'] });
    const reach = steps.find((s) => s.id === 'reach');
    expect(reach?.body).toContain('110');
    expect(reach?.body).toContain('90');
    expect(reach?.body).toContain('100');
    const drop = steps.find((s) => s.id === 'drop');
    expect(drop?.body).toContain('90');
    expect(drop?.body).toContain('75');
    expect(drop?.body).toContain('10');
  });
});
