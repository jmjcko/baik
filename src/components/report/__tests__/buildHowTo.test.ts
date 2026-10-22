import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { buildHowTo } from '../buildHowTo';
import type { FindingInput } from '../reportFindings';

const BASE: FindingInput = {
  inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, saddleHeightMm: 751,
  currentBarWidthMm: 420, currentSaddleHeightMm: 720,
};

describe.each(['en', 'cs'] as Locale[])('buildHowTo (%s)', (locale) => {
  const t = translations[locale];
  const h = t.diagnosticReport.howTo;

  it('should guide the saddle from the BB along the seat tube to the 70 mm mark with the KB increments and the target', () => {
    const guide = buildHowTo(t, 'saddle', BASE);
    expect(guide.tools).toEqual([h.tools.allen, h.tools.tape, h.tools.masking, h.tools.torque]);
    expect(guide.reference).toContain('751');
    expect(guide.reference).toContain('70');
    expect(guide.reference).toContain('(0,0)');
    expect(guide.steps.join(' ')).toContain('3–5 mm');
    expect(guide.steps.join(' ')).toContain('31');
    expect(guide.steps.join(' ')).not.toMatch(/\{\w+\}/);
  });

  it('should lower in 5 to 10 mm steps, keep within the tolerance and set the target when nothing was entered', () => {
    expect(buildHowTo(t, 'saddle', { ...BASE, currentSaddleHeightMm: 770 }).steps.join(' ')).toContain('5–10 mm');
    expect(buildHowTo(t, 'saddle', { ...BASE, currentSaddleHeightMm: 752 }).steps.join(' ')).toContain('3');
    expect(buildHowTo(t, 'saddle', { ...BASE, currentSaddleHeightMm: null }).steps.join(' ')).toContain('751');
  });

  it('should guide the handlebar swap to the recommended width and add the lever tip', () => {
    const guide = buildHowTo(t, 'handlebar', BASE);
    expect(guide.reference).toContain('380');
    expect(guide.steps.join(' ')).toContain('380');
    expect(guide.tip).toBe(h.handlebar.tip);
    expect(guide.tools).toContain(h.tools.torque);
  });

  it('should guide the crank change with the stamp, the recommended range and a saddle height re-check', () => {
    const guide = buildHowTo(t, 'crank', BASE);
    expect(guide.steps.join(' ')).toContain('172.5');
    expect(guide.steps.join(' ')).toContain('160–165');
    expect(guide.steps.join(' ')).toContain('751');
    expect(guide.tools).toContain(h.tools.crankSet);
  });

  it('should guide the pitch alone: at most 2 degrees nose down, with a spirit level and no cleat tools', () => {
    const guide = buildHowTo(t, 'pitch', BASE);
    expect(guide.steps.join(' ')).toContain('2°');
    expect(guide.steps).toHaveLength(3);
    expect(guide.tools).toEqual([h.tools.allen, h.tools.level, h.tools.torque]);
    expect(guide.steps.join(' ')).not.toMatch(/10.*17/);
  });

  it('should guide the cleats alone: 10 to 17 mm behind the 1st metatarsal joint, with a marker and no spirit level', () => {
    const guide = buildHowTo(t, 'cleat', BASE);
    expect(guide.reference).toMatch(/10.*17/);
    expect(guide.steps.join(' ')).toMatch(/10.*17/);
    expect(guide.steps).toHaveLength(3);
    expect(guide.tools).toEqual([h.tools.allen, h.tools.marker, h.tools.torque]);
    expect(guide.steps.join(' ')).not.toContain('2°');
  });

  it('should never name a torque value: the guides point to the value printed on the component', () => {
    for (const id of ['saddle', 'pitch', 'handlebar', 'crank', 'cleat'] as const) {
      const text = [buildHowTo(t, id, BASE).steps.join(' '), h.safety].join(' ');
      expect(text, id).not.toMatch(/\d+\s?(Nm|N·m|N\.m)/i);
    }
  });
});
