import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { buildActionPlan } from '../buildActionPlan';
import { buildFindings, type FindingInput } from '../reportFindings';
import { buildTargets } from '../buildTargets';

const input = (crankLengthMm: number): FindingInput => ({
  inseamMm: 840, acromionWidthMm: 380, crankLengthMm, currentBarWidthMm: 380, currentSaddleHeightMm: 742,
  saddleHeightMm: computeBikeFitCoordinates({ inseamMm: 840, crankLengthMm }).saddle.heightAlongTubeMm,
});

describe.each(['en', 'cs'] as Locale[])('the saddle height and the crank in the report (%s)', (locale) => {
  const t = translations[locale];
  const r = t.diagnosticReport;

  it('should write the plain LeMond title for the reference crank and the title with the compensation for another crank', () => {
    const title = (crank: number) => buildFindings(t, input(crank)).find((f) => f.id === 'saddle')?.title;
    expect(title(172.5)).toBe(r.saddleTitle.replace('{height}', '742').replace('{inseam}', '840').replace('{factor}', '0.883'));
    expect(title(165)).toBe(r.saddleTitleCrank.replace('{height}', '749').replace('{inseam}', '840').replace('{factor}', '0.883').replace('{change}', '+7.5').replace('{crank}', '165'));
    expect(title(175)).toContain('−2.5');
  });

  it('should explain the compensation in the origin of the saddle target, and not for the reference crank', () => {
    const origin = (crank: number) => buildTargets(t, input(crank), computeBikeFitCoordinates({ inseamMm: 840, crankLengthMm: crank }), 'road').find((x) => x.key === 'saddle')?.origin ?? '';
    expect(origin(165)).toContain('172.5');
    expect(origin(165)).toContain('+7.5');
    expect(origin(165)).toContain('749');
    expect(origin(172.5)).not.toContain('172.5');
  });

  it('should tell in the crank step of the plan to raise the saddle by the same millimetres when the crank is changed', () => {
    const step = buildActionPlan(t, input(172.5)).find((s) => s.id === 'crank');
    expect(step?.body).toContain(r.actionPlan.crankSaddle.replace('{current}', '172.5').replace('{target}', '165').replace('{delta}', '7.5'));
    const longer = buildActionPlan(t, input(170)).find((s) => s.id === 'crank');
    expect(longer?.body).toContain('5');
  });

  it('should say the same in the action of the crank finding', () => {
    const finding = buildFindings(t, input(172.5)).find((f) => f.id === 'crank');
    expect(finding?.action).toContain(r.crankSaddle.replace('{target}', '165').replace('{delta}', '7.5'));
  });
});
