import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DEFAULT_PROFILE } from '../useRiderProfile';
import { useStudioDraft } from '../useStudioDraft';

describe('useStudioDraft', () => {
  it('should start as a copy of the profile without a change', () => {
    const { result } = renderHook(() => useStudioDraft(DEFAULT_PROFILE, vi.fn()));
    expect(result.current.values).toEqual(DEFAULT_PROFILE);
    expect(result.current.changed).toBe(false);
    expect(result.current.coordinates.saddle.heightAlongTubeMm).toBe(742);
  });

  it('should keep changes in the copy, recompute the coordinates and report the change', () => {
    const apply = vi.fn();
    const { result } = renderHook(() => useStudioDraft(DEFAULT_PROFILE, apply));
    act(() => result.current.setters.setInseamMm(900));
    expect(result.current.changed).toBe(true);
    expect(result.current.coordinates.saddle.heightAlongTubeMm).toBe(795);
    expect(apply).not.toHaveBeenCalled();
  });

  it('should hand the copy to the profile on apply and go back to the profile values on restore', () => {
    const apply = vi.fn();
    const { result } = renderHook(() => useStudioDraft(DEFAULT_PROFILE, apply));
    act(() => result.current.setters.setCrankLengthMm(165));
    act(() => result.current.apply());
    expect(apply).toHaveBeenCalledWith({ ...DEFAULT_PROFILE, crankLengthMm: 165 });
    act(() => result.current.restore());
    expect(result.current.values).toEqual(DEFAULT_PROFILE);
    expect(result.current.changed).toBe(false);
  });
});
