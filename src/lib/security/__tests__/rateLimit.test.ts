import { describe, it, expect } from 'vitest';
import { clientKey, createRateLimiter } from '../rateLimit';

const HOUR = 3_600_000;

describe('createRateLimiter', () => {
  it('should allow up to the maximum within the window and refuse the next call', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: HOUR });
    expect([1, 2, 3].map(() => limiter.allow('a', 1000))).toEqual([true, true, true]);
    expect(limiter.allow('a', 1001)).toBe(false);
    expect(limiter.allow('a', 1002)).toBe(false);
  });

  it('should count every key on its own', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR });
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('b', 0)).toBe(true);
    expect(limiter.allow('a', 1)).toBe(false);
  });

  it('should let calls through again as the old ones leave the window (sliding)', () => {
    const limiter = createRateLimiter({ max: 2, windowMs: HOUR });
    limiter.allow('a', 0);
    limiter.allow('a', 30 * 60_000);
    expect(limiter.allow('a', HOUR - 1)).toBe(false);
    expect(limiter.allow('a', HOUR)).toBe(true);
    expect(limiter.allow('a', HOUR + 1)).toBe(false);
    expect(limiter.allow('a', 90 * 60_000)).toBe(true);
  });

  it('should not count a refused call, so a caller cannot extend its own block by trying again', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR });
    limiter.allow('a', 0);
    for (let i = 1; i < 50; i++) limiter.allow('a', i * 1000);
    expect(limiter.allow('a', HOUR)).toBe(true);
  });

  it('should forget the oldest keys when more keys than the bound are kept', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR, maxKeys: 2 });
    limiter.allow('a', 0);
    limiter.allow('b', 1);
    limiter.allow('c', 2);
    expect(limiter.allow('a', 3)).toBe(true);
    expect(limiter.allow('c', 4)).toBe(false);
  });

  it('should start again after a reset, and use the clock when no time is given', () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR });
    expect(limiter.allow('a')).toBe(true);
    expect(limiter.allow('a')).toBe(false);
    limiter.reset();
    expect(limiter.allow('a')).toBe(true);
  });
});

describe('clientKey', () => {
  const headers = (entries: Record<string, string>) => new Headers(entries);

  it('should take the first address of x-forwarded-for, then x-real-ip, then one shared bucket', () => {
    expect(clientKey(headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' }))).toBe('203.0.113.7');
    expect(clientKey(headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientKey(headers({}))).toBe('unknown');
    expect(clientKey(headers({ 'x-forwarded-for': ' ' }))).toBe('unknown');
  });

  it('should bound the length of the key', () => {
    expect(clientKey(headers({ 'x-forwarded-for': 'a'.repeat(500) }))).toHaveLength(64);
  });
});
