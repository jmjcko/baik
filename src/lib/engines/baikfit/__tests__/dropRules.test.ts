import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DROP_RULES, forbidsLongerStem, forbidsSaddleForward, loweringGuard, needsPositionChecks } from '../dropRules';

describe('hard guards of the position (KB backlog section 15)', () => {
  it.each([['numb_hands'], ['neck_pain'], ['lower_back']] as const)('should forbid lowering the handlebars for %s, whatever the style', (pain) => {
    expect(loweringGuard({ pains: [pain] })).toBe('symptom');
    expect(loweringGuard({ pains: [pain], style: 'race', flexibility: 'flexible' })).toBe('symptom');
    expect(needsPositionChecks({ pains: [pain] })).toBe(true);
  });

  it('should forbid lowering for an endurance position or an inflexible rider without a symptom, and say it is the style', () => {
    expect(loweringGuard({ pains: [], style: 'endurance' })).toBe('style');
    expect(loweringGuard({ pains: [], style: 'balanced', flexibility: 'inflexible' })).toBe('style');
    expect(loweringGuard({ pains: ['front_knee'], style: 'endurance' })).toBe('style');
  });

  it('should leave lowering to the geometry for a balanced or race rider with other symptoms only', () => {
    expect(loweringGuard({ pains: [], style: 'balanced' })).toBeNull();
    expect(loweringGuard({ pains: ['front_knee', 'back_knee', 'saddle_sores'], style: 'race', flexibility: 'moderate' })).toBeNull();
    expect(loweringGuard({ pains: [] })).toBeNull();
    expect(needsPositionChecks({ pains: ['front_knee', 'saddle_sores'] })).toBe(false);
  });

  it('should forbid moving the saddle forward only for numb hands', () => {
    expect(forbidsSaddleForward({ pains: ['numb_hands'] })).toBe(true);
    for (const pain of ['neck_pain', 'lower_back', 'front_knee', 'back_knee', 'saddle_sores'] as const) expect(forbidsSaddleForward({ pains: [pain] })).toBe(false);
  });

  it('should forbid a longer stem for numb hands and neck pain only', () => {
    expect(forbidsLongerStem({ pains: ['numb_hands'] })).toBe(true);
    expect(forbidsLongerStem({ pains: ['neck_pain'] })).toBe(true);
    expect(forbidsLongerStem({ pains: ['lower_back', 'front_knee'] })).toBe(false);
  });

  it('should hold the steps of the specification and keep the specification document in agreement', () => {
    expect(DROP_RULES).toEqual({ raiseBarsMm: { min: 10, max: 15 }, raiseBarsNeckMm: { min: 10, max: 20 }, stemShorterMm: { min: 10, max: 20 }, saddleBackMm: { min: 5, max: 10 } });
    const doc = readFileSync('docs/knowledge/saddle-to-bar-drop-rules.md', 'utf8');
    for (const part of ['10–15 mm', '10–20 mm', 'NEVER lower bars', 'Move saddle forward']) expect(doc).toContain(part);
  });
});
