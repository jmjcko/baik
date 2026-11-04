import { describe, it, expect } from 'vitest';
import { REFERENCE_CRANK_MM, crankCompensationMm } from '../kbRules';
import { calculateSaddleHeight, computeBikeFitCoordinates } from '../coordinates';
import { deriveCoordinates, DEFAULT_PROFILE } from '@/lib/profile/values';
import { readFileSync } from 'node:fs';

describe('the compensation of the saddle height for the crank (KB v1.5.0 section 5, owner baseline 172.5 mm)', () => {
  it('should take 172.5 mm as the reference crank and raise the saddle by the millimetres a crank is shorter', () => {
    expect(REFERENCE_CRANK_MM).toBe(172.5);
    expect(crankCompensationMm(172.5)).toBe(0);
    expect(crankCompensationMm(165)).toBe(7.5);
    expect(crankCompensationMm(170)).toBe(2.5);
    expect(crankCompensationMm(150)).toBe(22.5);
  });

  it('should lower the saddle by the millimetres a crank is longer (the rule is symmetric)', () => {
    expect(crankCompensationMm(175)).toBe(-2.5);
    expect(crankCompensationMm(177.5)).toBe(-5);
  });

  it('should give no compensation for an unknown crank or a number that is not a crank', () => {
    for (const bad of [undefined, null, Number.NaN, 0, 12, 400]) expect(crankCompensationMm(bad as number | undefined)).toBe(0);
  });

  it('should add the compensation to the LeMond height: inseam 840, 172.5 mm gives 742, 165 mm gives 749, 175 mm gives 739', () => {
    expect(calculateSaddleHeight(840)).toBe(742);
    expect(calculateSaddleHeight(840, 172.5)).toBe(742);
    expect(calculateSaddleHeight(840, 165)).toBe(749);
    expect(calculateSaddleHeight(840, 175)).toBe(739);
    expect(computeBikeFitCoordinates({ inseamMm: 840, crankLengthMm: 165 }).saddle.heightAlongTubeMm).toBe(749);
  });

  it('should keep the knee extension: the difference of the heights is exactly the difference of the cranks (172.5 to 165 is 7.5 mm)', () => {
    const before = 840 * 0.883 + crankCompensationMm(172.5);
    const after = 840 * 0.883 + crankCompensationMm(165);
    expect(after - before).toBeCloseTo(7.5, 10);
  });

  it('should not move the setback or the cockpit with the crank', () => {
    const base = computeBikeFitCoordinates({ inseamMm: 840 });
    const short = computeBikeFitCoordinates({ inseamMm: 840, crankLengthMm: 165 });
    expect(short.saddle.setbackXMm).toBe(base.saddle.setbackXMm);
    expect(short.cockpit).toEqual(base.cockpit);
  });

  it('should compensate the saddle of a profile for its crank, and leave a profile with the reference crank (the default) as it was', () => {
    expect(DEFAULT_PROFILE.crankLengthMm).toBe(172.5);
    expect(deriveCoordinates(DEFAULT_PROFILE).saddle.heightAlongTubeMm).toBe(742);
    expect(deriveCoordinates({ ...DEFAULT_PROFILE, crankLengthMm: 165 }).saddle.heightAlongTubeMm).toBe(749);
  });

  it('should be written in the knowledge base v1.5.0 as the owner baseline, symmetric', () => {
    const kb = readFileSync('docs/knowledge/baikfit_kb_v1.5.0.md', 'utf8');
    expect(kb).toMatch(/\[owner baseline\]/);
    expect(kb).toMatch(/\*\*172\.5 mm\*\*/);
    expect(kb).toMatch(/symmetric \[owner, 2026-11-04\]/);
  });
});
