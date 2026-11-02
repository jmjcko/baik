import { describe, it, expect } from 'vitest';
import type { Reminder } from '../reminderEngine';
import { byUrgency, elapsedPct, runwayModel } from '../runway';

const reminder = (over: Partial<Reminder>): Reminder => ({ id: 'chain', state: 'ok', lastOn: '2026-09-01', dueOn: '2026-10-31', daysLeft: 1, ...over });
const TODAY = '2026-10-30';

describe('the runway of the next twelve months', () => {
  it('should put today left of the middle and the months on the axis', () => {
    const model = runwayModel([], TODAY);
    expect(model.start).toBe('2026-08-01');
    expect(model.todayPct).toBeCloseTo((90 / 365) * 100, 5);
    expect(model.ticks[0]).toEqual({ day: '2026-08-01', pct: 0 });
    expect(model.ticks.map((tick) => tick.day.slice(0, 7)).slice(0, 3)).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(model.ticks.every((tick) => tick.pct >= 0 && tick.pct < 100)).toBe(true);
    expect(model.ticks).toHaveLength(12);
  });

  it('should place a bar from the last time to the due day', () => {
    const [lane] = runwayModel([reminder({})], TODAY).lanes;
    expect(lane.startPct).toBeCloseTo((31 / 365) * 100, 5);
    expect(lane.duePct).toBeCloseTo((91 / 365) * 100, 5);
    expect(lane).toMatchObject({ cutStart: false, cutEnd: false });
  });

  it('should cut a bar that begins before the window or ends after it', () => {
    const [before, after] = runwayModel([reminder({ lastOn: '2025-11-12', dueOn: '2026-11-12' }), reminder({ lastOn: '2026-10-01', dueOn: '2027-12-01' })], TODAY).lanes;
    expect(before).toMatchObject({ startPct: 0, cutStart: true, cutEnd: false });
    expect(after).toMatchObject({ duePct: 100, cutStart: false, cutEnd: true });
  });

  it('should leave a reminder without a date without a bar', () => {
    const [lane] = runwayModel([reminder({ state: 'unknown', lastOn: null, dueOn: null, daysLeft: null })], TODAY).lanes;
    expect(lane).toEqual({ id: 'chain', startPct: null, duePct: null, cutStart: false, cutEnd: false });
  });

  it('should say how much of the interval has passed, from 0 to 100', () => {
    expect(elapsedPct(reminder({ lastOn: '2026-10-01', dueOn: '2026-10-31' }), TODAY)).toBeCloseTo(96.67, 1);
    expect(elapsedPct(reminder({ lastOn: '2026-01-01', dueOn: '2026-02-01' }), TODAY)).toBe(100);
    expect(elapsedPct(reminder({ lastOn: '2026-10-31', dueOn: '2026-12-31' }), TODAY)).toBe(0);
    expect(elapsedPct(reminder({ lastOn: null, dueOn: null }), TODAY)).toBeNull();
  });

  it('should list the most urgent first and the unknown last', () => {
    const list = [reminder({ id: 'cable', state: 'ok', dueOn: '2027-04-01' }), reminder({ id: 'chain', state: 'unknown', dueOn: null, lastOn: null }), reminder({ id: 'sealant', state: 'soon', dueOn: '2026-10-30' }), reminder({ id: 'suspension', state: 'overdue', dueOn: '2026-09-01' }), reminder({ id: 'mcheck', state: 'ok', dueOn: '2026-11-10' })];
    expect(byUrgency(list).map((item) => item.id)).toEqual(['suspension', 'sealant', 'mcheck', 'cable', 'chain']);
  });
});
