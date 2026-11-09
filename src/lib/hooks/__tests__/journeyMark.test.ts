import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { AppMode } from '@/components/navigation/appMode';
import { JOURNEY_UNLOCKED_KEY, useJourney } from '../useJourney';

/** BUG-015: the mark of a signed in rider comes from the account, not from the localStorage of the address. */
describe('the setup mark of the journey', () => {
  beforeEach(() => localStorage.clear());
  const open = (mode: AppMode, mark: { done: boolean; guest: boolean }) => {
    const markDone = vi.fn();
    const view = renderHook(({ m }) => useJourney(m, vi.fn(), { ...mark, markDone }), { initialProps: { m: mode } });
    return { view, markDone };
  };

  it('should unlock a signed in rider whose account has the mark, with an empty browser storage', () => {
    const { view } = open('entry', { done: true, guest: false });
    expect(view.result.current.unlocked).toBe(true);
  });

  it('should keep a signed in rider locked when the account has no mark, even if this browser holds the older mark of someone else', () => {
    localStorage.setItem(JOURNEY_UNLOCKED_KEY, '1');
    const { view } = open('entry', { done: false, guest: false });
    expect(view.result.current.unlocked).toBe(false);
  });

  it('should still honour the older mark of this browser for a guest', () => {
    localStorage.setItem(JOURNEY_UNLOCKED_KEY, '1');
    const { view } = open('entry', { done: false, guest: true });
    expect(view.result.current.unlocked).toBe(true);
  });

  it('should write the mark to the passport once the report is reached, and not again when it is there', () => {
    const first = open('report', { done: false, guest: false });
    expect(first.markDone).toHaveBeenCalledTimes(1);
    const second = open('report', { done: true, guest: false });
    expect(second.markDone).not.toHaveBeenCalled();
  });
});
