import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { STOCK_BIKE_SPECS, evaluateStockBikeFit, type SizeSpec, type StockBikeSpec } from '..';
import { riderFromPassport } from '../riderFromPassport';

const [canyon, tarmac, trek, giant] = STOCK_BIKE_SPECS;

/** A rider of 178 cm with an inseam of 840 mm: the target numbers below were worked out by hand (see each test). */
const rider = (overrides: Partial<ProfileValues> = {}) => {
  const values: ProfileValues = { ...DEFAULT_PROFILE, inseamMm: 840, heightCm: 178, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, riderWeightKg: 75, ...overrides };
  return profileToPassport(values, deriveCoordinates(values));
};

const withSize = (patch: Partial<SizeSpec>, base: StockBikeSpec = canyon, size = 'M'): StockBikeSpec => ({ ...base, sizes: { ...base.sizes, [size]: { ...base.sizes[size], ...patch } } });

describe('evaluateStockBikeFit: changes that need no purchase', () => {
  /*
   * Inseam 840: saddle along the tube 742 (840 x 0.883), target setback 210 (0.25 x 840), target stack 600
   * (840 x 0.69 + 20 for a balanced style), target reach 378 (620 x 0.46 + 620 x 0.15).
   */
  const result = evaluateStockBikeFit(rider(), canyon, 'M');

  it('should move the saddle by the target setback minus the setback of the seat tube angle: 210 - 742 x cos 73.5 = -1 mm', () => {
    expect(result.diy.saddleSetbackDeltaMm).toEqual({ deltaMm: -1, basis: 'assumed' });
    expect(result.diy.saddleOutOfRailRange).toBe(false);
  });

  it('should add the spacers that the target stack needs above the frame stack against the factory spacers: (600 - 590) - 20 = -10 mm', () => {
    expect(result.diy.spacerDeltaMm).toEqual({ deltaMm: -10, basis: 'assumed' });
    expect(result.diy.spacersOverLimit).toBe(false);
  });

  it('should compare the target reach with the reach of the bike, the stock stem included: 378 - (378 + 100 - 100) = 0 mm', () => {
    expect(result.diy.reachDeltaMm).toBe(0);
  });

  it('should add the excess of a longer stock stem to the reach of the bike: Canyon XL, 378 - (405 + 110 - 100) = -37 mm', () => {
    expect(evaluateStockBikeFit(rider(), canyon, 'XL').diy.reachDeltaMm).toBe(-37);
  });

  it('should count an unpublished stem as the reference stem and say the stem is unknown (Trek 56: 378 - 377 = 1 mm)', () => {
    const trek56 = evaluateStockBikeFit(rider(), trek, '56');
    expect(trek56.diy.reachDeltaMm).toBe(1);
    expect(trek56.unknownComponents).toEqual(['handlebar', 'crank', 'seatpostOffset', 'spacers']);
  });

  it('should list the components that the maker does not publish and keep what it publishes out of the list', () => {
    expect(result.unknownComponents).toEqual(['seatpostOffset', 'spacers']);
    expect(result.bikeId).toBe('canyon-endurace-cf-8-di2-2024');
    expect(result.size).toBe('M');
  });

  it('should use the published seat post offset and spacers and say so: offset 25, spacers 30', () => {
    const bike = withSize({ stockSeatpostOffsetMm: 25, stockSpacersMm: 30 });
    const own = evaluateStockBikeFit(rider(), bike, 'M');
    expect(own.diy.saddleSetbackDeltaMm).toEqual({ deltaMm: -26, basis: 'stock' });
    expect(own.diy.spacerDeltaMm).toEqual({ deltaMm: -20, basis: 'stock' });
    expect(own.unknownComponents).toEqual([]);
  });

  it('should say when the saddle would have to move more than the rails allow (seat tube angle 70: 210 - 253.8 = -44 mm)', () => {
    const slack = evaluateStockBikeFit(rider(), withSize({ seatTubeAngleDeg: 70 }), 'M');
    expect(slack.diy.saddleSetbackDeltaMm.deltaMm).toBe(-44);
    expect(Math.abs(slack.diy.saddleSetbackDeltaMm.deltaMm)).toBeGreaterThan(ESTIMATES.saddleRailRangeMm.value);
    expect(slack.diy.saddleOutOfRailRange).toBe(true);
  });

  it('should say when the target needs more spacers than KB section 7 allows (Tarmac 52: 600 - 527 = 73 mm)', () => {
    const small = evaluateStockBikeFit(rider(), tarmac, '52');
    expect(small.diy.spacersOverLimit).toBe(true);
    expect(73).toBeGreaterThan(KB_RULES.maxSpacerStackMm);
    expect(small.diy.spacerDeltaMm.deltaMm).toBe(53);
  });

  it('should ask for the spacers to be taken off when the frame is higher than the target (Canyon XL: 0 - 20 = -20 mm)', () => {
    expect(evaluateStockBikeFit(rider(), canyon, 'XL').diy.spacerDeltaMm.deltaMm).toBe(-20);
  });
});

describe('evaluateStockBikeFit: the best size', () => {
  it('should recommend the size whose stack and reach match the rider and list every size, best first', () => {
    const { recommendedSize } = evaluateStockBikeFit(rider(), canyon, 'S');
    expect(recommendedSize.size).toBe('M');
    expect(recommendedSize.selectedIsBest).toBe(false);
    expect(recommendedSize.ranking.map((row) => row.size)).toEqual(['M', 'S', 'L', 'XL', 'XS']);
    expect(recommendedSize.ranking[0]).toEqual({ size: 'M', stackDeviationMm: 10, reachDeviationMm: 0, fitMatchScore: 98 });
  });

  it('should confirm the selected size when it is the best one, and give the same recommendation for every selected size', () => {
    expect(evaluateStockBikeFit(rider(), trek, '56').recommendedSize).toMatchObject({ size: '56', selectedIsBest: true });
    const sizes = trek.sizeOrder.map((size) => evaluateStockBikeFit(rider(), trek, size).recommendedSize.size);
    expect(new Set(sizes).size).toBe(1);
  });

  it('should recommend a larger frame for a taller rider and a smaller one for a shorter rider', () => {
    const tall = rider({ inseamMm: 900, torsoLengthMm: 680, armLengthMm: 680, heightCm: 190 });
    const short = rider({ inseamMm: 760, torsoLengthMm: 560, armLengthMm: 560, heightCm: 165 });
    const order = (size: string) => giant.sizeOrder.indexOf(size);
    expect(order(evaluateStockBikeFit(tall, giant, 'M').recommendedSize.size)).toBeGreaterThan(order(evaluateStockBikeFit(rider(), giant, 'M').recommendedSize.size));
    expect(order(evaluateStockBikeFit(short, giant, 'M').recommendedSize.size)).toBeLessThan(order(evaluateStockBikeFit(rider(), giant, 'M').recommendedSize.size));
  });

  it('should settle a tie by the smaller deviation and then the smaller size', () => {
    const ranking = evaluateStockBikeFit(rider(), canyon, 'M').recommendedSize.ranking;
    const scores = ranking.map((row) => row.fitMatchScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    const saturated = ranking.filter((row) => row.fitMatchScore === 60);
    const remaining = saturated.map((row) => Math.abs(row.stackDeviationMm) + Math.abs(row.reachDeviationMm));
    expect([...remaining].sort((a, b) => a - b)).toEqual(remaining);
  });
});

describe('evaluateStockBikeFit: factory component traps', () => {
  it('should warn about a handlebar wider than the shoulders in both languages (Canyon M 410 mm, shoulders 380 mm)', () => {
    const { alerts, traps } = evaluateStockBikeFit(rider(), canyon, 'M');
    expect(alerts.map((alert) => alert.component)).toEqual(['handlebar']);
    expect(traps.en).toHaveLength(1);
    expect(traps.cs).toHaveLength(1);
    expect(traps.en[0]).toMatchObject({ component: 'Handlebar / Cockpit Width', stockSpec: '410mm Factory Handlebar', recommendedSpec: '380mm Ergonomic Handlebar' });
    expect(traps.cs[0].stockSpec).toBe('410 mm sériová řídítka');
    expect(traps.cs[0].riskExplanation).toContain('380');
  });

  it('should warn about a handlebar that is clearly too narrow (shoulders 440 mm, Canyon XS 370 mm) and not about one step', () => {
    const wide = rider({ acromionWidthMm: 440 });
    const narrow = evaluateStockBikeFit(wide, canyon, 'XS');
    expect(narrow.alerts.map((alert) => alert.component)).toEqual(['handlebar']);
    expect(narrow.alerts[0].reasoningEn).toContain('narrower than your shoulders');
    expect(narrow.traps.en[0].recommendedSpec).toBe('440mm Ergonomic Handlebar');
    expect(narrow.traps.cs[0].riskExplanation).toContain('užší');
    const oneStep = evaluateStockBikeFit(wide, tarmac, '54');
    expect(oneStep.alerts).toEqual([]);
    expect(oneStep.traps.en).toEqual([]);
  });

  it('should not warn about a handlebar that fits (shoulders 420 mm recommend 420 mm, Canyon M 410 mm is within one step)', () => {
    expect(evaluateStockBikeFit(rider({ acromionWidthMm: 420 }), canyon, 'M').alerts).toEqual([]);
  });

  it('should warn about long cranks only when the rider is heavy, tall or inflexible, as KB section 5 and 7 say', () => {
    expect(evaluateStockBikeFit(rider({ acromionWidthMm: 440 }), tarmac, '58').alerts).toEqual([]);
    const heavy = evaluateStockBikeFit(rider({ acromionWidthMm: 440, riderWeightKg: 95 }), tarmac, '58');
    expect(heavy.alerts.map((alert) => alert.component)).toEqual(['crank']);
    expect(heavy.traps.en[0].stockSpec).toBe('175mm Factory Cranks');
    expect(heavy.traps.cs[0].component).toBe('Délka klik');
    const flexible = evaluateStockBikeFit(rider({ acromionWidthMm: 440 }), tarmac, '58', { flexibility: 'inflexible' });
    expect(flexible.alerts.map((alert) => alert.component)).toEqual(['crank']);
  });

  it('should warn about a crank over 165 mm for every rider when the report asks for the "always" rule', () => {
    const light = rider({ acromionWidthMm: 440 });
    expect(evaluateStockBikeFit(light, tarmac, '58').alerts).toEqual([]);
    const always = evaluateStockBikeFit(light, tarmac, '58', { crankRule: 'always' });
    expect(always.alerts.map((alert) => alert.component)).toEqual(['crank']);
    expect(always.traps.en[0].stockSpec).toBe('175mm Factory Cranks');
    const short = evaluateStockBikeFit(light, withSize({ stockCrankMm: 165 }, tarmac, '52'), '52', { crankRule: 'always' });
    expect(short.alerts.map((alert) => alert.component)).not.toContain('crank');
    expect(evaluateStockBikeFit(light, trek, '56', { crankRule: 'always' }).alerts).toEqual([]);
  });

  it('should warn about both parts together, one trap for each, in the same order in both languages', () => {
    const both = evaluateStockBikeFit(rider({ riderWeightKg: 95 }), tarmac, '58');
    expect(both.alerts.map((alert) => alert.component)).toEqual(['handlebar', 'crank']);
    expect(both.traps.en.map((trap) => trap.component)).toEqual(['Handlebar / Cockpit Width', 'Crankarm Length']);
    expect(both.traps.cs.map((trap) => trap.component)).toEqual(['Šířka řídítek / Kokpit', 'Délka klik']);
  });

  it('should give no warning about a part the maker does not publish (Trek: handlebar and crank unknown)', () => {
    const result = evaluateStockBikeFit(rider({ riderWeightKg: 110 }), trek, '56');
    expect(result.alerts).toEqual([]);
    expect(result.traps).toEqual({ en: [], cs: [] });
    expect(result.unknownComponents).toContain('handlebar');
    expect(result.unknownComponents).toContain('crank');
  });
});

describe('evaluateStockBikeFit: contract', () => {
  it('should throw a RangeError for a size the bike does not have', () => {
    expect(() => evaluateStockBikeFit(rider(), canyon, 'XXL')).toThrow(RangeError);
    expect(() => evaluateStockBikeFit(rider(), canyon, 'XXL')).toThrow('canyon-endurace-cf-8-di2-2024 has no size XXL');
  });

  it('should not change the passport or the bike and should give the same answer twice', () => {
    const passport = rider();
    const before = JSON.stringify([passport, canyon]);
    const first = evaluateStockBikeFit(passport, canyon, 'M');
    expect(evaluateStockBikeFit(passport, canyon, 'M')).toEqual(first);
    expect(JSON.stringify([passport, canyon])).toBe(before);
  });

  it('should keep the score between 60 and 98 for every bike and size', () => {
    for (const bike of STOCK_BIKE_SPECS) {
      for (const size of bike.sizeOrder) {
        const { fitMatchScore } = evaluateStockBikeFit(rider(), bike, size);
        expect(fitMatchScore).toBeGreaterThanOrEqual(60);
        expect(fitMatchScore).toBeLessThanOrEqual(98);
      }
    }
  });

  it('should build the rider profile of the pre-purchase rules from the passport', () => {
    const passport = rider();
    expect(riderFromPassport(passport)).toMatchObject({ inseamMm: 840, acromionWidthMm: 380, riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [] });
    expect(riderFromPassport(passport, 'flexible').flexibilityScore).toBe('flexible');
    const sore = rider({ currentPains: ['numb_hands'], currentSaddleHeightMm: 700, currentBarWidthMm: 420, crankLengthMm: 172.5 });
    expect(riderFromPassport(sore)).toMatchObject({ currentPains: ['numb_hands'], currentSaddleHeightMm: 700, currentBarWidthMm: 420, currentCrankLengthMm: 172.5 });
  });

  it('should reference the knowledge base backlog for the estimates that the audit adds', () => {
    const backlog = readFileSync('docs/knowledge/kb_backlog.md', 'utf8');
    expect(backlog).toMatch(/^## 13\. /m);
    for (const name of ['referenceStemMm', 'saddleRailRangeMm', 'assumedStockSpacersMm', 'assumedStockSeatpostOffsetMm', 'narrowBarToleranceMm'] as const) {
      expect(ESTIMATES[name].backlogRef, name).toBe('docs/knowledge/kb_backlog.md#13');
      expect(backlog, name).toContain(name);
    }
  });
});
