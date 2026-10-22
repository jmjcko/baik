import { describe, it, expect } from 'vitest';
import { loadKnowledgeBase } from '@/lib/kbLoader';
import {
  KB_RULES,
  KB_RULE_SOURCES,
  isBarTooWide,
  barExcessMm,
  isCrankOversized,
  recommendedBarWidthMm,
  saddleAdjustment,
  ulnarRisk,
} from '../kbRules';
import { ESTIMATES } from '../estimates';

describe('handlebar width rule (KB 2.2, 1:1 to acromion, commercial widths)', () => {
  it.each([
    [340, 380], [380, 380], [389, 380], [390, 380], [391, 400], [400, 400],
    [409, 400], [410, 400], [411, 420], [420, 420], [430, 420], [431, 440], [460, 440],
  ])('should recommend the nearest commercial width for an acromion of %imm (narrower on a tie)', (acromion, expected) => {
    expect(recommendedBarWidthMm(acromion)).toBe(expected);
  });

  it('should flag a stock bar wider than the recommendation only', () => {
    expect(isBarTooWide(420, 380)).toBe(true);
    expect(isBarTooWide(420, 400)).toBe(true);
    expect(isBarTooWide(420, 420)).toBe(false);
    expect(isBarTooWide(400, 420)).toBe(false);
  });
});

describe('ulnar risk of a stock bar (KB 2.2, steps of one commercial width)', () => {
  it('should measure the excess over the recommended commercial width', () => {
    expect(barExcessMm(420, 380)).toBe(40);
    expect(barExcessMm(420, 410)).toBe(20);
    expect(barExcessMm(420, 420)).toBe(0);
    expect(barExcessMm(400, 440)).toBe(0);
  });

  it.each([
    [420, 440, 'LOW'], [420, 420, 'LOW'], [420, 400, 'MODERATE'], [420, 380, 'HIGH'], [440, 400, 'HIGH'],
  ] as const)('should rate a %imm stock bar for an acromion of %imm as %s', (stock, acromion, expected) => {
    expect(ulnarRisk(stock, acromion)).toBe(expected);
  });
});

describe('saddle height adjustment (LeMond target, KB 6 steps)', () => {
  it('should report no adjustment within the on-target tolerance', () => {
    expect(saddleAdjustment(742, 742)).toEqual({ deltaMm: 0, direction: 'none' });
    expect(saddleAdjustment(745, 742).direction).toBe('none');
    expect(saddleAdjustment(739, 742).direction).toBe('none');
  });

  it('should take the tolerance from the KB (3 mm): 3 mm is on target, 4 mm is not', () => {
    expect(KB_RULES.saddleToleranceMm).toBe(3);
    expect(saddleAdjustment(745, 742).direction).toBe('none');
    expect(saddleAdjustment(746, 742)).toEqual({ deltaMm: 4, direction: 'lower' });
    expect(saddleAdjustment(738, 742)).toEqual({ deltaMm: 4, direction: 'raise' });
  });

  it('should say lower when the saddle is above the target and raise when it is below', () => {
    expect(saddleAdjustment(760, 742)).toEqual({ deltaMm: 18, direction: 'lower' });
    expect(saddleAdjustment(720, 742)).toEqual({ deltaMm: 22, direction: 'raise' });
  });
});

describe('crank rule (KB 5 and 7)', () => {
  const light = { flexibilityScore: 'moderate' as const, riderWeightKg: 75 };

  it('should never flag cranks at or below 165 mm', () => {
    expect(isCrankOversized(165, { flexibilityScore: 'inflexible', riderWeightKg: 120 })).toBe(false);
  });

  it('should flag an oversized crank for limited flexibility or high body mass only', () => {
    expect(isCrankOversized(172.5, { ...light, flexibilityScore: 'inflexible' })).toBe(true);
    expect(isCrankOversized(172.5, { ...light, riderWeightKg: ESTIMATES.heavyRiderKg.value + 1 })).toBe(true);
    expect(isCrankOversized(172.5, { ...light, riderWeightKg: ESTIMATES.heavyRiderKg.value })).toBe(false);
    expect(isCrankOversized(172.5, light)).toBe(false);
  });

  it('should use the product owner thresholds: above 90 kg or above 188 cm', () => {
    expect(ESTIMATES.heavyRiderKg.value).toBe(90);
    expect(ESTIMATES.tallRiderCm.value).toBe(188);
    expect(isCrankOversized(172.5, { ...light, riderHeightCm: 189 })).toBe(true);
    expect(isCrankOversized(172.5, { ...light, riderHeightCm: 188 })).toBe(false);
    expect(isCrankOversized(172.5, { ...light, riderWeightKg: 91 })).toBe(true);
  });

  it('should accept a rider without a flexibility score (path A has none)', () => {
    expect(isCrankOversized(172.5, { riderWeightKg: 110 })).toBe(true);
    expect(isCrankOversized(172.5, { riderWeightKg: 70 })).toBe(false);
  });
});

describe('commercial handlebar widths come from the KB (2.2)', () => {
  it('should expose the widths that the KB lists', () => {
    expect(KB_RULES.commercialBarWidthsMm).toEqual([380, 400, 420, 440]);
  });
});

describe('SSOT guard: every KB rule constant is backed by the knowledge base text', () => {
  const kb = loadKnowledgeBase('baikfit');

  it.each(Object.entries(KB_RULE_SOURCES))('should find the KB phrase for %s', (_name, source) => {
    expect(kb).toContain(source.phrase);
  });

  it('should document a KB section for every rule constant', () => {
    expect(Object.keys(KB_RULE_SOURCES).sort()).toEqual(Object.keys(KB_RULES).sort());
  });
});

describe('saddle Y projection (KB 1.1)', () => {
  it('should define Saddle Y as a vertical projection and keep the along-tube height for setup', () => {
    const kb = loadKnowledgeBase('baikfit');
    expect(kb).toContain('Saddle Y (Vertical Coordinate)');
    expect(kb).toContain('distance along the seat tube axis');
  });

  it('should keep the seat tube angle an explicit estimate', () => {
    expect(ESTIMATES.seatTubeAngleDeg.value).toBe(73.5);
  });
});

describe('estimates are explicit and documented', () => {
  it('should reference the backlog for every estimate', () => {
    for (const [name, estimate] of Object.entries(ESTIMATES)) {
      expect(estimate.backlogRef, name).toMatch(/kb_backlog\.md#/);
      expect(estimate.reason.length, name).toBeGreaterThan(10);
    }
  });
});
