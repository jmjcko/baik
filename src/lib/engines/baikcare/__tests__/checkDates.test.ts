import { describe, it, expect } from 'vitest';
import { DEFAULT_CARE } from '@/types/maintain';
import { parseCare, isDefaultCare } from '@/lib/passport/parseCare';
import { withNodeStatus, withTyreStatus } from '../mcheck';

describe('the day of each place of the check', () => {
  it('should keep the day of a node when it is marked and the day of the last inspection, and take it away when the node goes back to not checked', () => {
    const marked = withNodeStatus(DEFAULT_CARE, 3, 'warn', '2026-11-04');
    expect(marked.nodeDates).toEqual({ 3: '2026-11-04' });
    expect(marked.inspectedAt).toBe('2026-11-04');
    const later = withNodeStatus(marked, 1, 'pass', '2026-11-05');
    expect(later.nodeDates).toEqual({ 1: '2026-11-05', 3: '2026-11-04' });
    const reset = withNodeStatus(later, 3, 'unchecked', '2026-11-06');
    expect(reset.nodeDates).toEqual({ 1: '2026-11-05' });
    expect(reset.inspectedAt).toBe('2026-11-05');
  });

  it('should keep the day of a tyre apart from the nodes', () => {
    const care = withTyreStatus(DEFAULT_CARE, 'rear', 'fail', '2026-11-04');
    expect(care.tyreDates).toEqual({ rear: '2026-11-04' });
    expect(care.nodeDates).toBeUndefined();
  });

  it('should not change the care that was never marked, and not mutate what it was given', () => {
    const before = JSON.stringify(DEFAULT_CARE);
    withNodeStatus(DEFAULT_CARE, 2, 'pass', '2026-11-04');
    expect(JSON.stringify(DEFAULT_CARE)).toBe(before);
    expect(isDefaultCare(DEFAULT_CARE)).toBe(true);
  });

  it('should read stored days, leave out a damaged one and add no key for a care that has none', () => {
    const stored = { ...DEFAULT_CARE, nodeDates: { 1: '2026-11-04', 2: 'yesterday', 9: '2026-11-04' }, tyreDates: { front: '2026-11-03', rear: 5 } };
    const care = parseCare(stored);
    expect(care?.nodeDates).toEqual({ 1: '2026-11-04' });
    expect(care?.tyreDates).toEqual({ front: '2026-11-03' });
    const plain = parseCare(DEFAULT_CARE);
    expect(plain).toBeDefined();
    expect('nodeDates' in (plain as object)).toBe(false);
    expect('tyreDates' in (plain as object)).toBe(false);
  });
});
