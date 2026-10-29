import { describe, it, expect } from 'vitest';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { chainStatus, chainVerdict, parseChainWear } from '../chainWear';
import { addMonths, barTapeAlert, todayOf } from '../barTape';
import { summarize, withNodeStatus, worstStatus } from '../mcheck';

describe('chain verdict (KB bAIkcare 2.2)', () => {
  it.each([
    [0.3, 'ok'], [0.49, 'ok'], [0.5, 'replaceChain'], [0.74, 'replaceChain'], [0.75, 'replaceChainAndCassette'], [0.76, 'replaceChainAndCassette'], [1, 'replaceChainAndCassette'],
  ])('should read %s %% on 11 to 12 speeds as %s', (pct, verdict) => {
    expect(chainVerdict(pct, '11-12')).toBe(verdict);
  });

  it.each([
    [0.5, 'ok'], [0.74, 'ok'], [0.75, 'replaceChain'], [0.99, 'replaceChain'], [1, 'replaceDrivetrain'], [1.01, 'replaceDrivetrain'],
  ])('should read %s %% on 8 to 10 speeds as %s', (pct, verdict) => {
    expect(chainVerdict(pct, '8-10')).toBe(verdict);
  });

  it('should give no verdict without a reading, and map a verdict to a status', () => {
    expect(chainVerdict(null, '11-12')).toBeNull();
    expect([null, 'ok', 'replaceChain', 'replaceChainAndCassette', 'replaceDrivetrain'].map((verdict) => chainStatus(verdict as never))).toEqual(['unchecked', 'pass', 'warn', 'fail', 'fail']);
  });

  it('should parse a typed reading with a decimal comma and refuse anything implausible', () => {
    expect(parseChainWear('0,5')).toBe(0.5);
    expect(parseChainWear(' 0.75 ')).toBe(0.75);
    expect(['', 'abc', '-1', '3.5'].map(parseChainWear)).toEqual([null, null, null, null]);
  });
});

describe('handlebar tape of an indoor bike (KB bAIkcare 4.2)', () => {
  const care = (patch: Partial<BikeCare>) => ({ ...DEFAULT_CARE, ...patch });

  it('should warn after six months and not before, and only on a trainer bike', () => {
    expect(barTapeAlert(care({ trainer: true, barTapeAt: '2026-04-29' }), '2026-10-28')).toBe('none');
    expect(barTapeAlert(care({ trainer: true, barTapeAt: '2026-04-29' }), '2026-10-29')).toBe('due');
    expect(barTapeAlert(care({ trainer: false, barTapeAt: '2020-01-01' }), '2026-10-29')).toBe('none');
  });

  it('should ask for the day when it is missing or not a day', () => {
    expect(barTapeAlert(care({ trainer: true }), '2026-10-29')).toBe('unknown');
    expect(barTapeAlert(care({ trainer: true, barTapeAt: 'soon' }), '2026-10-29')).toBe('unknown');
  });

  it('should add months to the end of a month without skipping one and format today', () => {
    expect(addMonths('2026-08-31', 6)).toBe('2027-03-03');
    expect(todayOf(new Date(2026, 9, 5))).toBe('2026-10-05');
  });
});

describe('M-Check state', () => {
  it('should take the worst checked node as the status of the bike, and ignore unchecked ones', () => {
    expect(worstStatus(['unchecked', 'unchecked'])).toBe('unchecked');
    expect(worstStatus(['unchecked', 'pass'])).toBe('pass');
    expect(worstStatus(['pass', 'fail', 'warn'])).toBe('fail');
  });

  it('should set a node, move the inspection day, and list the nodes that need attention, worst first', () => {
    let care = withNodeStatus(DEFAULT_CARE, 3, 'warn', '2026-10-29');
    care = withNodeStatus(care, 5, 'fail', '2026-10-30');
    care = withNodeStatus(care, 1, 'pass', '2026-10-30');
    expect(care.inspectedAt).toBe('2026-10-30');
    expect(summarize(care)).toEqual({ checked: 3, overall: 'fail', attention: [5, 3] });
    expect(summarize(DEFAULT_CARE)).toEqual({ checked: 0, overall: 'unchecked', attention: [] });
  });

  it('should keep the inspection day when a node is taken back to not checked', () => {
    const done = withNodeStatus(DEFAULT_CARE, 2, 'pass', '2026-10-29');
    expect(withNodeStatus(done, 2, 'unchecked', '2026-11-01')).toMatchObject({ inspectedAt: '2026-10-29' });
  });
});
