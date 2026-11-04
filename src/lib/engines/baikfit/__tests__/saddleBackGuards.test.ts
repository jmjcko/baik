import { describe, it, expect } from 'vitest';
import { DROP_RULES, forbidsSaddleBack } from '../dropRules';
import { setbackDelta } from '../customSetup';
import { SLUMPING_SETBACK_MM, mobilityAdjustments } from '../mobility';
import { deriveCoordinates } from '@/lib/profile/values';
import { DEFAULT_PROFILE } from '@/lib/profile/values';

describe('the saddle back and the joints (KB 1.5.0 sections 4.4 and 8.5)', () => {
  it('should name the limit of 15 mm and forbid the saddle back only for pain at the back of the knee', () => {
    expect(DROP_RULES.saddleBackCapMm).toBe(15);
    expect(DROP_RULES.saddleBackCapMm).toBeGreaterThan(DROP_RULES.saddleBackMm.max);
    expect(forbidsSaddleBack({ pains: ['back_knee'] })).toBe(true);
    expect(forbidsSaddleBack({ pains: ['numb_hands', 'front_knee'] })).toBe(false);
    expect(forbidsSaddleBack({ pains: [] })).toBe(false);
  });

  it('should move the target saddle back after a fall forward and leave it where it is with pain at the back of the knee', () => {
    expect(mobilityAdjustments({ release: 'slumping' }).setbackOffsetMm).toBe(SLUMPING_SETBACK_MM);
    expect(mobilityAdjustments({ release: 'slumping' }, ['numb_hands']).setbackOffsetMm).toBe(SLUMPING_SETBACK_MM);
    expect(mobilityAdjustments({ release: 'slumping' }, ['back_knee']).setbackOffsetMm).toBe(0);
    expect(mobilityAdjustments({ release: 'stable' }, []).setbackOffsetMm).toBe(0);
    expect(mobilityAdjustments({ hamstring: 'low' }, ['back_knee']).stackOffsetMm).toBeGreaterThan(0);
  });

  it('should keep the target setback of the coordinates at the plain value with pain at the back of the knee', () => {
    const base = { ...DEFAULT_PROFILE, releaseTest: 'slumping' as const };
    const plain = deriveCoordinates({ ...base, currentPains: [] });
    const knee = deriveCoordinates({ ...base, currentPains: ['back_knee'] });
    const none = deriveCoordinates({ ...base, releaseTest: 'stable', currentPains: [] });
    expect(Math.abs(plain.saddle.setbackXMm) - Math.abs(none.saddle.setbackXMm)).toBe(SLUMPING_SETBACK_MM);
    expect(knee.saddle.setbackXMm).toBe(none.saddle.setbackXMm);
  });

  it('should keep one total limit of 15 mm: the fall forward of the mini-test is part of the target, so the move from the measured setback counts both', () => {
    const base = { ...DEFAULT_PROFILE, releaseTest: 'stable' as const, currentPains: [] };
    const without = Math.abs(deriveCoordinates(base).saddle.setbackXMm);
    const withSlump = Math.abs(deriveCoordinates({ ...base, releaseTest: 'slumping' }).saddle.setbackXMm);
    expect(withSlump - without).toBe(SLUMPING_SETBACK_MM);
    const measured = without - 10;
    expect(setbackDelta(measured, without, { pains: [] })).toEqual({ mm: 10, direction: 'back' });
    expect(setbackDelta(measured, withSlump, { pains: [] })).toEqual({ mm: DROP_RULES.saddleBackCapMm, direction: 'back', capped: true });
  });
});
