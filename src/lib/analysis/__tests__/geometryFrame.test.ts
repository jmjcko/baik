import { describe, it, expect } from 'vitest';
import { bestFrameOf } from '../geometryFrame';
import { generateDeterministicAnalysis } from '../deterministicAnalysis';
import { estimateStockFrame } from '../stockFrame';
import { CANYON_GEOMETRY, PROFILE_MATRIX, requestFor } from './profiles';

const rider = PROFILE_MATRIX.baseline;

describe('bestFrameOf', () => {
  it('should pick the size of the table that fits the rider best, with the factory parts of that size', () => {
    const frame = bestFrameOf(rider, CANYON_GEOMETRY);
    expect(CANYON_GEOMETRY.sizes.map((row) => row.size)).toContain(frame.size);
    const spec = CANYON_GEOMETRY.sizes.find((row) => row.size === frame.size)!.spec;
    expect([frame.stackMm, frame.barWidthMm, frame.crankMm]).toEqual([spec.frameStackMm, spec.stockHandlebarMm, spec.stockCrankMm]);
  });

  it('should use 0 for a part that the table does not state, so that no rule is raised about it', () => {
    const unknown = { source: 'rider' as const, sizes: CANYON_GEOMETRY.sizes.map((row) => ({ size: row.size, spec: { ...row.spec, stockHandlebarMm: null, stockCrankMm: null } })) };
    const frame = bestFrameOf(rider, unknown);
    expect([frame.barWidthMm, frame.crankMm]).toEqual([0, 0]);
  });
});

describe('the deterministic audit with a geometry', () => {
  it('should take the frame, the stack and the reach from the table of the bike, not from the estimate for the height', () => {
    const withTable = generateDeterministicAnalysis(requestFor('baseline'));
    const estimate = estimateStockFrame(rider.heightCm);
    const frame = bestFrameOf(rider, CANYON_GEOMETRY);
    expect(withTable.recommendedFrameSize).toBe(frame.size);
    expect(withTable.stackMatch.stockStackMm).toBe(frame.stackMm);
    expect(withTable.reachMatch.stockReachMm).toBe(frame.reachMm);
    expect(frame.stackMm).not.toBe(estimate.stackMm);
  });

  it('should flag a factory handlebar that is wider than the shoulders from the table, and not one that the table does not state', () => {
    const wide = { source: 'rider' as const, sizes: CANYON_GEOMETRY.sizes.map((row) => ({ size: row.size, spec: { ...row.spec, stockHandlebarMm: 460 } })) };
    const narrowRider = { ...rider, acromionWidthMm: 380 };
    const alerts = generateDeterministicAnalysis({ ...requestFor('baseline'), riderProfile: narrowRider, geometry: wide }).componentMismatchAlerts;
    expect(alerts.map((alert) => alert.component)).toContain('handlebar');
    const unknown = { source: 'rider' as const, sizes: CANYON_GEOMETRY.sizes.map((row) => ({ size: row.size, spec: { ...row.spec, stockHandlebarMm: null } })) };
    expect(generateDeterministicAnalysis({ ...requestFor('baseline'), riderProfile: narrowRider, geometry: unknown }).componentMismatchAlerts.map((alert) => alert.component)).not.toContain('handlebar');
  });
});
