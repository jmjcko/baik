import { describe, it, expect } from 'vitest';
import { formatVersion } from '../version';

describe('formatVersion', () => {
  it('should write the number, the commit and the day of the build in one line', () => {
    expect(formatVersion({ version: '0.48.3', commit: '223eab0', built: '2026-11-09' })).toBe('v0.48.3 · 223eab0 · 2026-11-09');
  });

  it('should leave out what is not known, and write only dev for a build without a version', () => {
    expect(formatVersion({ version: '0.48.3', commit: '', built: '' })).toBe('v0.48.3');
    expect(formatVersion({ version: 'dev', commit: 'abc1234', built: '2026-11-09' })).toBe('dev');
  });
});
