import { describe, it, expect } from 'vitest';
import { loadKnowledgeBase } from '@/lib/kbLoader';
import { assessBar, assessCrank, linkSymptoms } from '../advice';
import { KB_RULES } from '../kbRules';
import { saddleAdjustment } from '../kbRules';

describe('assessBar (KB 2.2)', () => {
  it('should flag a bar wider than the recommended commercial width and report the excess', () => {
    expect(assessBar(440, 390)).toEqual({ stockMm: 440, recommendedMm: 380, tooWide: true, excessMm: 60, entered: true });
  });

  it('should assume the 420 mm factory bar when nothing was entered', () => {
    expect(assessBar(null, 390)).toMatchObject({ stockMm: 420, tooWide: true, entered: false });
    expect(assessBar(null, 420)).toMatchObject({ tooWide: false, excessMm: 0 });
  });
});

describe('assessCrank (KB 5)', () => {
  it('should report the real knee height difference against the longest recommended crank', () => {
    expect(assessCrank(172.5)).toEqual({ currentMm: 172.5, recommendedMm: 165, kneeHigherMm: 7.5 });
    expect(assessCrank(170).kneeHigherMm).toBe(5);
    expect(assessCrank(160).kneeHigherMm).toBe(0);
  });
});

describe('linkSymptoms (KB 6 with measured deviations)', () => {
  const lowSaddle = saddleAdjustment(726, 742);
  const highSaddle = saddleAdjustment(760, 742);
  const onTarget = saddleAdjustment(743, 742);
  const wideBar = assessBar(440, 390);

  it('should link anterior knee pain to a saddle that is too low', () => {
    expect(linkSymptoms(['front_knee'], { saddle: lowSaddle, bar: null })).toEqual([
      { pain: 'front_knee', diagnosis: 'anteriorKnee', cause: 'saddleLow', deltaMm: 16 },
    ]);
  });

  it('should link posterior knee pain to a saddle that is too high', () => {
    expect(linkSymptoms(['back_knee'], { saddle: highSaddle, bar: null })).toEqual([
      { pain: 'back_knee', diagnosis: 'posteriorKnee', cause: 'saddleHigh', deltaMm: 18 },
    ]);
  });

  it('should link numb hands and neck pain to a bar that is too wide', () => {
    const links = linkSymptoms(['neck_pain', 'numb_hands'], { saddle: null, bar: wideBar });
    expect(links.map((l) => [l.pain, l.diagnosis, l.cause, l.deltaMm])).toEqual([
      ['numb_hands', 'ulnar', 'barWide', 60],
      ['neck_pain', 'neck', 'barWide', 60],
    ]);
  });

  it('should not link without data, within tolerance, in the wrong direction or for other symptoms', () => {
    expect(linkSymptoms(['front_knee', 'back_knee', 'numb_hands'], { saddle: null, bar: null })).toEqual([]);
    expect(linkSymptoms(['front_knee', 'back_knee'], { saddle: onTarget, bar: null })).toEqual([]);
    expect(linkSymptoms(['front_knee'], { saddle: highSaddle, bar: null })).toEqual([]);
    expect(linkSymptoms(['lower_back', 'saddle_sores'], { saddle: lowSaddle, bar: wideBar })).toEqual([]);
    expect(linkSymptoms(['numb_hands'], { saddle: null, bar: assessBar(380, 390) })).toEqual([]);
  });

  it('should not link a bar that was only assumed (factory 420 mm) because it is not measured data', () => {
    expect(linkSymptoms(['numb_hands'], { saddle: null, bar: assessBar(null, 390) })).toEqual([]);
  });
});

describe('KB grounding of the action plan values', () => {
  it('should find the cleat setback and pitch phrases in the KB', () => {
    const kb = loadKnowledgeBase('baikfit');
    expect(kb).toContain('10 to 17 mm behind the 1st metatarsal joint');
    expect(KB_RULES.cleatSetbackMm).toEqual({ min: 10, max: 17 });
  });
});
