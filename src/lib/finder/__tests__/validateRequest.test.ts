import { describe, it, expect } from 'vitest';
import { validateRecommendRequest } from '../validateRequest';
import type { FinderRider } from '../types';

const rider: FinderRider = { heightCm: 178, inseamMm: 840, torsoLengthMm: 620, armLengthMm: 640, acromionWidthMm: 400, riderWeightKg: 75, ridingStyle: 'balanced', flexibilityScore: 'moderate', currentPains: ['numb_hands'] };
const valid = { category: 'road', locale: 'en', rider, answers: { shifting: ['electronic'] } };

describe('validateRecommendRequest', () => {
  it('should return the request with only the answers that belong to the kind of bike', () => {
    expect(validateRecommendRequest({ ...valid, answers: { shifting: ['electronic'], suspension: ['full'] } })).toEqual({ category: 'road', locale: 'en', rider, answers: { shifting: ['electronic'] } });
  });

  it('should drop a pain that does not exist', () => {
    expect(validateRecommendRequest({ ...valid, rider: { ...rider, currentPains: ['numb_hands', 'bad_mood'] } })?.rider.currentPains).toEqual(['numb_hands']);
  });

  it.each([
    ['no input', undefined],
    ['an unknown kind of bike', { ...valid, category: 'ebike' }],
    ['an unknown language', { ...valid, locale: 'de' }],
    ['an implausible height', { ...valid, rider: { ...rider, heightCm: 20 } }],
    ['a text instead of a number', { ...valid, rider: { ...rider, inseamMm: '840' } }],
    ['an unknown riding style', { ...valid, rider: { ...rider, ridingStyle: 'drift' } }],
    ['an unknown flexibility', { ...valid, rider: { ...rider, flexibilityScore: 'rubber' } }],
    ['no rider', { ...valid, rider: null }],
  ])('should refuse %s', (_name, input) => {
    expect(validateRecommendRequest(input)).toBeNull();
  });
});
