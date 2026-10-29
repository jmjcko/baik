import { describe, it, expect } from 'vitest';
import { positionContextOf } from '../dropRules';
import { raisedDrop, setbackDelta, stemDelta } from '../customSetup';

const none = positionContextOf({});
const numbHands = positionContextOf({ pains: ['numb_hands'] });
const neck = positionContextOf({ pains: ['neck_pain'] });

describe('setbackDelta', () => {
  it('should move the saddle back by the missing millimetres (180 against 195 is 15 back)', () => {
    expect(setbackDelta(180, 195, none)).toEqual({ mm: 15, direction: 'back' });
  });

  it('should move the saddle forward when it is too far back, but never forward for numb hands', () => {
    expect(setbackDelta(210, 195, none)).toEqual({ mm: 15, direction: 'forward' });
    expect(setbackDelta(210, 195, numbHands)).toBeNull();
  });

  it('should give no delta inside the tolerance or when nothing was measured', () => {
    expect(setbackDelta(193, 195, none)).toBeNull();
    expect(setbackDelta(null, 195, none)).toBeNull();
  });
});

describe('stemDelta', () => {
  it('should shorten a mountain bike stem down to the maximum of the KB range, and leave a short one alone', () => {
    expect(stemDelta(70, true, none)).toEqual({ mm: 20, direction: 'shorter' });
    expect(stemDelta(45, true, none)).toBeNull();
  });

  it('should have no target length for a road stem: only numb hands or neck pain shorten it, never lengthen', () => {
    expect(stemDelta(110, false, none)).toBeNull();
    expect(stemDelta(110, false, numbHands)).toEqual({ mm: 20, direction: 'shorter' });
    expect(stemDelta(110, false, neck)?.direction).toBe('shorter');
    expect(stemDelta(null, false, numbHands)).toBeNull();
  });
});

describe('raisedDrop', () => {
  it('should raise the bars by the rule for a rider who must not go lower, and say nothing for others', () => {
    expect(raisedDrop(90, numbHands)).toEqual({ fromMm: 90, toMin: 75, toMax: 80 });
    expect(raisedDrop(90, neck)).toEqual({ fromMm: 90, toMin: 70, toMax: 80 });
    expect(raisedDrop(90, none)).toBeNull();
    expect(raisedDrop(null, numbHands)).toBeNull();
  });
});
