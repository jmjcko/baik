import { describe, it, expect } from 'vitest';
import { WEAR_COMPONENTS, WEAR_INTERVALS } from '../wearIntervals';
import { chainStretchWear, componentWear, healthLevel, healthScore, rideFactor, wearReport, type Ride, type WearInput } from '../wearEngine';

const ride = (over: Partial<Ride> = {}): Ride => ({ date: '2026-10-01', terrain: 'road', km: 100, elevationM: 0, rain: false, ...over });
const input = (rides: Ride[], over: Partial<WearInput> = {}): WearInput => ({ rides, lastService: {}, now: '2026-11-05', ...over });

describe('effective service kilometres of a ride', () => {
  it.each([
    ['road', 100],
    ['gravel', 130],
    ['mtb', 160],
    ['trainer', 60],
  ] as const)('should count 100 km on %s as %d km for the chain', (terrain, expected) => {
    expect(componentWear('chainLube', input([ride({ terrain })])).usedKm).toBeCloseTo(expected);
  });

  it('should count a trainer ride at 3.0 for the parts that sweat reaches, not 0.6', () => {
    const trainer = input([ride({ terrain: 'trainer' })]);
    expect(componentWear('mcheck', trainer).usedKm).toBeCloseTo(300);
    expect(componentWear('bearings', trainer).usedKm).toBeCloseTo(300);
    expect(componentWear('sealant', trainer).usedKm).toBeCloseTo(60);
  });

  it('should add 0.1 for every 1,000 m of climbing per 100 km, on the drivetrain and the brakes only', () => {
    expect(rideFactor(ride({ elevationM: 2000 }), 'chainLube')).toBeCloseTo(1.2);
    expect(rideFactor(ride({ km: 20, elevationM: 1000 }), 'brakeCheck')).toBeCloseTo(1.5);
    expect(rideFactor(ride({ elevationM: 2000 }), 'sealant')).toBe(1);
  });

  it('should multiply the rain by 1.5 on the drivetrain and the brakes only', () => {
    expect(rideFactor(ride({ rain: true }), 'chainGauge')).toBeCloseTo(1.5);
    expect(rideFactor(ride({ rain: true }), 'brakeBleed')).toBeCloseTo(1.5);
    expect(rideFactor(ride({ rain: true }), 'sealant')).toBe(1);
    expect(rideFactor(ride({ rain: true }), 'mcheck')).toBe(1);
  });

  it('should multiply the terrain, the climbing and the rain together', () => {
    expect(componentWear('chainLube', input([ride({ km: 50, terrain: 'mtb', elevationM: 1000, rain: true })])).usedKm).toBeCloseTo(50 * 1.6 * 1.2 * 1.5);
  });
});

describe('the use of a part', () => {
  it('should reach 1 at the interval of the distance', () => {
    expect(componentWear('chainLube', input([ride()])).wear).toBeCloseTo(1);
    expect(componentWear('chainGauge', input([ride()])).wear).toBeCloseTo(0.2);
  });

  it('should count only the rides after the last service of that part', () => {
    const rides = [ride({ date: '2026-09-01' }), ride({ date: '2026-10-10', km: 40 })];
    expect(componentWear('chainLube', input(rides, { lastService: { chainLube: '2026-09-01' } })).usedKm).toBeCloseTo(40);
    expect(componentWear('chainDeep', input(rides)).usedKm).toBeCloseTo(140);
  });

  it('should count the suspension on gravel and mountain bike rides only', () => {
    expect(componentWear('suspensionSmall', input([ride({ km: 1000 })])).wear).toBe(0);
    expect(componentWear('suspensionSmall', input([ride({ km: 500, terrain: 'mtb' })])).wear).toBeCloseTo(0.8);
    expect(componentWear('suspensionFull', input([ride({ km: 500, terrain: 'gravel' })])).wear).toBeCloseTo(0.26);
  });

  it('should be due by the time as well as by the distance', () => {
    expect(componentWear('brakeBleed', input([], { lastService: { brakeBleed: '2026-05-05' } })).wear).toBeCloseTo(0.5, 1);
    expect(componentWear('brakeBleed', input([], { lastService: { brakeBleed: '2025-09-05' } })).wear).toBeGreaterThan(1);
    expect(componentWear('brakeBleed', input([])).wear).toBe(0);
  });

  it('should be due by 2,500 m of descent counted as the climbing, for the brake check', () => {
    const rides = [ride({ km: 10, elevationM: 1250 }), ride({ km: 10, elevationM: 1250 })];
    expect(componentWear('brakeCheck', input(rides)).wear).toBeGreaterThanOrEqual(1);
  });

  it('should ignore a ride that is not valid', () => {
    const bad = [ride({ km: -5 }), ride({ km: Number.NaN }), ride({ date: 'yesterday' }), ride({ elevationM: -1 })];
    expect(componentWear('chainLube', input(bad)).usedKm).toBe(0);
  });
});

describe('the chain gauge', () => {
  it.each([
    [0.5, '11-12', 1],
    [0.25, '11-12', 0.5],
    [0.75, '8-10', 1],
  ] as const)('should read %d %% on a %s drivetrain as %d of the limit', (pct, speeds, expected) => {
    expect(chainStretchWear(pct, speeds)?.wear).toBeCloseTo(expected);
  });

  it('should say nothing when the chain was not measured or the reading is not a number', () => {
    expect(chainStretchWear(null)).toBeNull();
    expect(chainStretchWear(Number.NaN)).toBeNull();
    expect(chainStretchWear(-1)).toBeNull();
  });
});

describe('the Bike Health Score', () => {
  it('should be 100 and level 1 for a bike without rides', () => {
    const report = wearReport(input([]));
    expect(report).toMatchObject({ health: 100, level: 1, alerts: [] });
  });

  it('should be decided by the most worn safety part', () => {
    const report = wearReport(input([ride({ km: 250 })]));
    expect(report.health).toBe(70);
    expect(report.level).toBe(2);
  });

  it('should not lower the score for a routine job, only raise an alert', () => {
    const report = wearReport(input([ride({ km: 100 })]));
    expect(report.components.find((c) => c.id === 'chainLube')?.wear).toBeCloseTo(1);
    expect(report.health).toBe(88);
    expect(report.alerts).toContainEqual({ kind: 'due', component: 'chainLube', wear: expect.closeTo(1) });
  });

  it('should score exactly the safety parts of the KB', () => {
    const scoredIds = WEAR_COMPONENTS.filter((id) => WEAR_INTERVALS[id].scored);
    expect(scoredIds).toEqual(['brakeCheck', 'brakeBleed', 'sealant', 'suspensionSmall', 'suspensionFull', 'mcheck', 'bearings']);
  });

  it.each([[100, 1], [85, 1], [84, 2], [50, 2], [49, 3], [20, 3], [19, 4], [0, 4]] as const)('should put a score of %d on level %d', (score, level) => {
    expect(healthLevel(score)).toBe(level);
  });

  it('should never go below 0 or above 100', () => {
    expect(healthScore([{ id: 'brakeCheck', usedKm: 900, wear: 9 }])).toBe(0);
    expect(healthScore([{ id: 'chainLube', usedKm: 900, wear: 9 }])).toBe(100);
    expect(healthScore([])).toBe(100);
  });

  it('should put a part at its interval on 40 (level 3) and at twice the interval on 0 (level 4)', () => {
    expect(healthScore([{ id: 'brakeCheck', usedKm: 500, wear: 1 }])).toBe(40);
    expect(healthLevel(40)).toBe(3);
    expect(healthScore([{ id: 'brakeCheck', usedKm: 1000, wear: 2 }])).toBe(0);
    expect(healthScore([{ id: 'brakeCheck', usedKm: 750, wear: 1.5 }])).toBe(20);
  });

  it('should put a chain stretched to twice its limit on the critical level', () => {
    const report = wearReport(input([], { chainWearPct: 1.0, speeds: '11-12' }));
    expect(report.level).toBe(4);
    expect(report.alerts[0]).toMatchObject({ kind: 'due', component: 'chainStretch' });
  });
});

describe('the alerts', () => {
  it('should list the parts that reached their interval, the most worn first', () => {
    const report = wearReport(input([ride({ km: 300 })]));
    const due = report.alerts.filter((alert) => alert.kind === 'due').map((alert) => alert.kind === 'due' && alert.component);
    expect(due).toEqual(['chainLube', 'chainDeep']);
  });

  it('should ask for the chain after the kilometres in the rain since it was last cleaned', () => {
    const rides = [ride({ date: '2026-10-01', km: 30, rain: true }), ride({ date: '2026-10-05', km: 90, rain: true }), ride({ date: '2026-10-06', km: 50 })];
    expect(wearReport(input(rides)).alerts).toContainEqual({ kind: 'wetRide', km: 120 });
    expect(wearReport(input(rides, { lastService: { chainLube: '2026-10-05' } })).alerts.some((alert) => alert.kind === 'wetRide')).toBe(false);
  });
});
