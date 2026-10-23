import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import { evaluateStockBikeFit } from '@/lib/bikes/evaluateStockBikeFit';
import { riderFromPassport } from '@/lib/bikes/riderFromPassport';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { computeFitTargets } from '@/lib/analysis/stockFrame';
import { frameOf } from '@/lib/bikes/frameOf';
import { loweringGuard, positionContextOf } from '../dropRules';
import { LOW_HAMSTRING_STACK_MM, MOBILITY_RULES, SLUMPING_SETBACK_MM, flexibilityOf, mobilityAdjustments } from '../mobility';

const rider = (over: Partial<ProfileValues> = {}): ProfileValues => ({ ...DEFAULT_PROFILE, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, ridingStyle: 'balanced', ...over });
const canyon = STOCK_BIKE_SPECS.find((bike) => bike.id === 'canyon-endurace-cf-8-di2-2024')!;
const audit = (values: ProfileValues) => evaluateStockBikeFit(profileToPassport(values, deriveCoordinates(values)), canyon, 'M', { crankRule: 'always' });

describe('the values of the two mini-tests', () => {
  it('should lie inside the ranges of the product owner', () => {
    expect(LOW_HAMSTRING_STACK_MM).toBeGreaterThanOrEqual(MOBILITY_RULES.lowStackRangeMm.min);
    expect(LOW_HAMSTRING_STACK_MM).toBeLessThanOrEqual(MOBILITY_RULES.lowStackRangeMm.max);
    expect(SLUMPING_SETBACK_MM).toBeGreaterThanOrEqual(MOBILITY_RULES.slumpSetbackRangeMm.min);
    expect(SLUMPING_SETBACK_MM).toBeLessThanOrEqual(MOBILITY_RULES.slumpSetbackRangeMm.max);
    expect(MOBILITY_RULES.hamstringAnglesDeg).toEqual({ low: 60, high: 75 });
  });

  it('should change only what the answer asks for', () => {
    expect(mobilityAdjustments({ hamstring: 'low', release: null })).toEqual({ stackOffsetMm: 18, setbackOffsetMm: 0 });
    expect(mobilityAdjustments({ hamstring: null, release: 'slumping' })).toEqual({ stackOffsetMm: 0, setbackOffsetMm: 7 });
    for (const none of [null, undefined, {}, { hamstring: 'medium' as const }, { hamstring: 'high' as const, release: 'stable' as const }]) expect(mobilityAdjustments(none)).toEqual({ stackOffsetMm: 0, setbackOffsetMm: 0 });
  });

  it('should read the hamstring test as the flexibility of the rider', () => {
    expect([flexibilityOf('low'), flexibilityOf('medium'), flexibilityOf('high'), flexibilityOf(null), flexibilityOf(undefined)]).toEqual(['inflexible', 'moderate', 'flexible', undefined, undefined]);
  });
});

describe('low hamstring flexibility (straight leg raise below 60 degrees) raises the target stack', () => {
  it('should raise the target handlebar stack by 15 to 20 mm and leave the rest of the cockpit and the saddle alone', () => {
    const base = deriveCoordinates(rider());
    const low = deriveCoordinates(rider({ hamstringTest: 'low' }));
    expect(low.cockpit.stackYMm - base.cockpit.stackYMm).toBe(18);
    expect(low.cockpit.stackYMm - base.cockpit.stackYMm).toBeGreaterThanOrEqual(15);
    expect(low.cockpit.stackYMm - base.cockpit.stackYMm).toBeLessThanOrEqual(20);
    expect(low.cockpit.reachXMm).toBe(base.cockpit.reachXMm);
    expect(low.saddle).toEqual(base.saddle);
  });

  it('should not change the stack for a medium or a high result', () => {
    const base = deriveCoordinates(rider());
    for (const hamstringTest of ['medium', 'high'] as const) expect(deriveCoordinates(rider({ hamstringTest }))).toEqual(base);
  });

  it('should raise the stack that the stock bike audit aims at, so the spacers to add grow by the same 18 mm', () => {
    const before = audit(rider()).diy.spacerDeltaMm.deltaMm;
    expect(audit(rider({ hamstringTest: 'low' })).diy.spacerDeltaMm.deltaMm - before).toBe(18);
    expect(audit(rider({ hamstringTest: 'high' })).diy.spacerDeltaMm.deltaMm).toBe(before);
  });

  it('should raise the target stack of the fit targets by the same amount and read the flexibility from the passport', () => {
    const values = rider({ hamstringTest: 'low' });
    const passport = profileToPassport(values, deriveCoordinates(values));
    const withTest = riderFromPassport(passport);
    expect(withTest).toMatchObject({ flexibilityScore: 'inflexible', fitStackOffsetMm: 18 });
    const without = riderFromPassport(profileToPassport(rider(), deriveCoordinates(rider())));
    expect(without).toMatchObject({ flexibilityScore: 'moderate', fitStackOffsetMm: 0 });
    const frame = frameOf('M', canyon.sizes.M);
    expect(computeFitTargets(withTest, frame).recommendedStackMm - computeFitTargets(without, frame).recommendedStackMm).toBe(18);
    expect(riderFromPassport(passport, 'flexible').flexibilityScore).toBe('flexible');
  });

  it('should count the rider as inflexible for the guard against lowering the handlebars', () => {
    expect(loweringGuard(positionContextOf({ pains: [], style: 'balanced', hamstringTest: 'low' }))).toBe('style');
    expect(loweringGuard(positionContextOf({ pains: [], style: 'balanced', hamstringTest: 'high' }))).toBeNull();
  });
});

describe('slumping in the release test moves the saddle back and guards against lowering', () => {
  it('should move the target setback 5 to 8 mm back (7 mm) and leave the height and the cockpit alone', () => {
    const base = deriveCoordinates(rider());
    const slumping = deriveCoordinates(rider({ releaseTest: 'slumping' }));
    expect(slumping.saddle.setbackXMm - base.saddle.setbackXMm).toBe(-7);
    expect(base.saddle.setbackXMm - slumping.saddle.setbackXMm).toBeGreaterThanOrEqual(5);
    expect(base.saddle.setbackXMm - slumping.saddle.setbackXMm).toBeLessThanOrEqual(8);
    expect(slumping.saddle.heightAlongTubeMm).toBe(base.saddle.heightAlongTubeMm);
    expect(slumping.cockpit).toEqual(base.cockpit);
    expect(deriveCoordinates(rider({ releaseTest: 'stable' }))).toEqual(base);
  });

  it('should ask the stock bike audit for a saddle 7 mm further back on its rails', () => {
    const before = audit(rider()).diy.saddleSetbackDeltaMm.deltaMm;
    expect(audit(rider({ releaseTest: 'slumping' })).diy.saddleSetbackDeltaMm.deltaMm - before).toBe(7);
    expect(audit(rider({ releaseTest: 'stable' })).diy.saddleSetbackDeltaMm.deltaMm).toBe(before);
  });

  it('should activate the hard guard against lowering the handlebars, also without a reported symptom or a style', () => {
    expect(loweringGuard(positionContextOf({ pains: [], style: 'race', releaseTest: 'slumping' }))).toBe('symptom');
    expect(loweringGuard(positionContextOf({ pains: [], style: 'race', releaseTest: 'stable' }))).toBeNull();
  });
});
