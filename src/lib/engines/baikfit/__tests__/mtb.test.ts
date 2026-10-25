import { describe, it, expect } from 'vitest';
import { loadKnowledgeBase } from '@/lib/kbLoader';
import { ESTIMATES } from '../estimates';
import { MTB_RULES, MTB_RULE_SOURCES } from '../mtbRules';
import { DEFAULT_MTB_SETUP, dropperHeights, dynamicGeometry, flatBarTargetMm, forkSagMm, inLimits, sagOf, stemAdvice, MTB_LIMITS, type MtbSetup } from '../mtb';

const setup = (over: Partial<MtbSetup> = {}): MtbSetup => ({ ...DEFAULT_MTB_SETUP, ...over });

describe('MTB rules follow the knowledge base (KB 11 and 6)', () => {
  const kb = loadKnowledgeBase('baikfit');

  it.each(Object.entries(MTB_RULE_SOURCES))('should find the phrase of %s in the KB text', (_name, { phrase }) => {
    expect(kb).toContain(phrase);
  });

  it('should keep the rule values the KB states', () => {
    expect(MTB_RULES.sagTargetPercent).toEqual({ xc: { min: 15, max: 20 }, trail: { min: 25, max: 30 } });
    expect(MTB_RULES.barOffsetMm).toEqual({ xc: 320, trail: 360 });
    expect(MTB_RULES.barRangeMm).toEqual({ xc: { min: 720, max: 760 }, trail: { min: 760, max: 800 } });
    expect(MTB_RULES.stemRangeMm).toEqual({ min: 35, max: 50 });
  });

  it('should tie the sag estimate to the backlog', () => {
    expect(ESTIMATES.mtbHardtailSag.backlogRef).toMatch(/kb_backlog\.md#18/);
  });
});

describe('sag of the fork (KB 11.1)', () => {
  it('should start from 20% for XC and 25% for Trail, and take the rider\'s own target', () => {
    expect(sagOf(setup())).toBe(20);
    expect(sagOf(setup({ style: 'trail' }))).toBe(25);
    expect(sagOf(setup({ style: 'trail', sagPercent: 28 }))).toBe(28);
  });

  it('should compute the fork sag from the travel, or nothing without a travel', () => {
    expect(forkSagMm(setup({ travelMm: 100 }))).toBe(20);
    expect(forkSagMm(setup({ style: 'trail', travelMm: 140 }))).toBe(35);
    expect(forkSagMm(setup())).toBeNull();
    expect(dynamicGeometry(setup())).toBeNull();
  });

  it('should steepen the head angle by 0.5 degrees per 10 mm and gain 5 to 8 mm of reach on a hardtail (XC, 100 mm fork)', () => {
    expect(dynamicGeometry(setup({ travelMm: 100 }))).toEqual({ forkSagMm: 20, headAngleSteeperDeg: 1, reachGainMm: { min: 5, max: 8 } });
  });

  it('should do the same arithmetic for a Trail hardtail with a 140 mm fork at 25%', () => {
    expect(dynamicGeometry(setup({ style: 'trail', travelMm: 140 }))).toEqual({ forkSagMm: 35, headAngleSteeperDeg: 1.8, reachGainMm: { min: 5, max: 8 } });
  });

  it('should leave a full suspension bike at its static geometry', () => {
    expect(dynamicGeometry(setup({ fullSuspension: true, style: 'trail', travelMm: 150 }))).toEqual({ forkSagMm: 38, headAngleSteeperDeg: 0, reachGainMm: null });
  });
});

describe('flat bar width and stem (KB 11.2)', () => {
  it.each([
    [400, 'xc', 720], [420, 'xc', 740], [440, 'xc', 760], [460, 'xc', 760],
    [380, 'trail', 760], [400, 'trail', 760], [420, 'trail', 780], [440, 'trail', 800], [470, 'trail', 800],
  ] as const)('should give a bar for an acromion of %i mm and %s of %i mm (rounded to 10, inside the range)', (acromion, style, expected) => {
    expect(flatBarTargetMm(acromion, style)).toBe(expected);
  });

  it('should round to 10 mm before it keeps the range', () => {
    expect(flatBarTargetMm(414, 'xc')).toBe(730);
    expect(flatBarTargetMm(416, 'xc')).toBe(740);
  });

  it('should shorten the stem by 10 mm for every 20 mm of extra width over the current bar', () => {
    expect(stemAdvice(780, 740)).toEqual({ changeMm: -20, extraBarMm: 40 });
    expect(stemAdvice(760, 740)).toEqual({ changeMm: -10, extraBarMm: 20 });
  });

  it('should lengthen the stem a little when the new bar is narrower, and advise nothing without a bar or a change', () => {
    expect(stemAdvice(740, 780)).toEqual({ changeMm: 20, extraBarMm: -40 });
    expect(stemAdvice(780, null)).toBeNull();
    expect(stemAdvice(780, 780)).toBeNull();
  });
});

describe('dropper post (KB 11.3)', () => {
  it('should set the extended height as given and lower it by the travel', () => {
    expect(dropperHeights(742, setup({ dropperTravelMm: 150 }))).toEqual({ extendedMm: 742, loweredMm: 592 });
    expect(dropperHeights(742, setup())).toEqual({ extendedMm: 742, loweredMm: null });
  });
});

describe('limits of the entered numbers', () => {
  it('should accept plausible numbers only', () => {
    expect(inLimits(120, MTB_LIMITS.travelMm)).toBe(true);
    expect(inLimits(10, MTB_LIMITS.travelMm)).toBe(false);
    expect(inLimits(25, MTB_LIMITS.sagPercent)).toBe(true);
    expect(inLimits(Number.NaN, MTB_LIMITS.sagPercent)).toBe(false);
    expect(inLimits(150, MTB_LIMITS.dropperTravelMm)).toBe(true);
  });
});
