import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeBikeGeometry } from '@/app/actions/analyzeBikeGeometry';
import { PROFILE_MATRIX, requestFor } from './profiles';
import fixture from './deterministic.fixture.json';

describe('deterministic analysis (characterization against the reference output)', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it.each(Object.keys(PROFILE_MATRIX))('should return the reference report for the %s rider', async (name) => {
    const result = await analyzeBikeGeometry(requestFor(name));
    expect(result).toEqual((fixture as Record<string, unknown>)[name]);
  });
});
