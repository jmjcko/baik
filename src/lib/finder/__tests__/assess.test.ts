import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { RiderProfile } from '@/types/baikfit';
import { VERDICT_CHANGES_SCORE, VERDICT_GOOD_SCORE, assessBike, resolveCandidate, verdictOf } from '../assess';

const rider: RiderProfile = { heightCm: 178, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 620, acromionWidthMm: 380, riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [] };
const canyon = STOCK_BIKE_SPECS.find((bike) => bike.id === 'canyon-endurace-cf-8-di2-2024')!;

describe('resolveCandidate', () => {
  it('should find a seed bike by the name that the AI gives', () => {
    const resolved = resolveCandidate({ brand: 'Canyon', model: 'Endurace CF 8', year: 2024, reason: 'x' }, []);
    expect(resolved?.bike.id).toBe(canyon.id);
    expect(resolved?.yearDiffers).toBe(false);
  });

  it('should say when the model year of the AI is not the one of the catalog', () => {
    expect(resolveCandidate({ brand: 'Canyon', model: 'Endurace CF 8', year: 2026, reason: 'x' }, [])?.yearDiffers).toBe(true);
    expect(resolveCandidate({ brand: 'Canyon', model: 'Endurace CF 8', year: null, reason: 'x' }, [])?.yearDiffers).toBe(false);
  });

  it('should find a bike of the community catalog by brand and model, ignoring spaces and case', () => {
    const community = { ...canyon, id: 'community-x', brand: 'Brand Co', model: 'Speed 5', matchPhrases: [] };
    expect(resolveCandidate({ brand: 'brand  co', model: 'SPEED-5', year: 2024, reason: 'x' }, [community])?.bike.id).toBe('community-x');
  });

  it('should not take another build for the same bike, and return null for an unknown model', () => {
    expect(resolveCandidate({ brand: 'Canyon', model: 'Endurace CF 7', year: 2024, reason: 'x' }, [])).toBeNull();
    expect(resolveCandidate({ brand: 'Nobody', model: 'Nothing', year: 2024, reason: 'x' }, [])).toBeNull();
  });
});

describe('assessBike', () => {
  it('should pick the best size of the bike for the rider and say how far it is from the target', () => {
    const result = assessBike(rider, canyon);
    expect(canyon.sizeOrder).toContain(result.bestSize);
    expect(result.sizes).toEqual(canyon.sizeOrder);
    expect(Number.isInteger(result.stackDeviationMm) && Number.isInteger(result.reachDeviationMm)).toBe(true);
    expect(result.fitMatchScore).toBeGreaterThanOrEqual(60);
  });

  it('should judge by the geometry only: a preference in the profile cannot change the size', () => {
    expect(assessBike(rider, canyon).bestSize).toBe(assessBike({ ...rider }, canyon).bestSize);
  });

  it('should warn about a wide factory handlebar of a drop bar bike but not judge the flat bar of a mountain bike', () => {
    const wide = { ...canyon, sizes: Object.fromEntries(Object.entries(canyon.sizes).map(([size, spec]) => [size, { ...spec, stockHandlebarMm: 460 }])) };
    expect(assessBike(rider, wide).traps.en.map((trap) => trap.component).join(' ')).toMatch(/handlebar/i);
    expect(assessBike({ ...rider, bikeKind: 'xc_mtb' }, wide).traps.en.map((trap) => trap.component).join(' ')).not.toMatch(/handlebar/i);
  });
});

describe('verdictOf with the deviations', () => {
  it('should not call a bike a good fit when the best size needs more than a few millimetres of change', () => {
    expect(verdictOf(96, 10, 5)).toBe('good');
    expect(verdictOf(96, 20, 0)).toBe('changes');
    expect(verdictOf(96, -20, 0)).toBe('changes');
    expect(verdictOf(96, 0, 25)).toBe('changes');
  });

  it('should call it no match when the spacers cannot make up the stack (KB 7) or the reach is far from the target', () => {
    expect(verdictOf(96, 41, 0)).toBe('low');
    expect(verdictOf(96, 0, -35)).toBe('low');
  });

  it('should never be better than the score says', () => {
    expect(verdictOf(70, 0, 0)).toBe('low');
    expect(verdictOf(85, 0, 0)).toBe('changes');
  });
});

describe('verdictOf', () => {
  it('should draw the lines at the thresholds', () => {
    expect([verdictOf(VERDICT_GOOD_SCORE), verdictOf(VERDICT_GOOD_SCORE - 1), verdictOf(VERDICT_CHANGES_SCORE), verdictOf(VERDICT_CHANGES_SCORE - 1)]).toEqual(['good', 'changes', 'changes', 'low']);
  });
});
