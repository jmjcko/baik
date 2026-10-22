import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RIDER_PROFILE_STORAGE_KEY } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, pickStoredValues, useRiderProfile } from '../useRiderProfile';

describe('pickStoredValues', () => {
  it('should keep only the fields present in a (possibly legacy) stored profile', () => {
    expect(pickStoredValues({ inseamMm: 800, discipline: 'gravel' })).toEqual({ inseamMm: 800, discipline: 'gravel' });
    expect(pickStoredValues({})).toEqual({});
  });

  it('should keep an explicit null for a not entered current setup', () => {
    expect(pickStoredValues({ currentBarWidthMm: null })).toEqual({ currentBarWidthMm: null });
  });

  it('should ignore unrelated stored keys', () => {
    expect(pickStoredValues({ savedAt: 'x', coordinates: undefined, heightCm: 190 })).toEqual({ heightCm: 190 });
  });
});

describe('useRiderProfile', () => {
  beforeEach(() => localStorage.clear());

  it('should start with the defaults and compute the LeMond saddle height', () => {
    const { result } = renderHook(() => useRiderProfile());
    expect(result.current.values).toEqual(DEFAULT_PROFILE);
    expect(result.current.coordinates.saddle.heightAlongTubeMm).toBe(742);
  });

  it('should hydrate every stored field, including a legacy profile, after mount', () => {
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify({ inseamMm: 900, ridingStyle: 'race', currentPains: ['neck_pain'] }));
    const { result } = renderHook(() => useRiderProfile());
    expect(result.current.values.inseamMm).toBe(900);
    expect(result.current.values.ridingStyle).toBe('race');
    expect(result.current.values.currentPains).toEqual(['neck_pain']);
    expect(result.current.values.heightCm).toBe(DEFAULT_PROFILE.heightCm);
  });

  it('should auto-save changes after hydration', () => {
    const { result } = renderHook(() => useRiderProfile());
    act(() => result.current.setters.setHeightCm(190));
    const saved = JSON.parse(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY) ?? '{}');
    expect(saved.heightCm).toBe(190);
  });

  it('should not auto-save an invalid inseam and should fall back to the default for the coordinates', () => {
    const { result } = renderHook(() => useRiderProfile());
    act(() => result.current.setters.setInseamMm(450));
    expect(JSON.parse(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY) ?? '{}').inseamMm).not.toBe(450);
    expect(result.current.coordinates.saddle.heightAlongTubeMm).toBe(742);
  });

  it('should start with the current saddle height and bar width not entered', () => {
    const { result } = renderHook(() => useRiderProfile());
    expect(result.current.values.currentSaddleHeightMm).toBeNull();
    expect(result.current.values.currentBarWidthMm).toBeNull();
  });

  it('should persist and hydrate the current saddle height and bar width', () => {
    const first = renderHook(() => useRiderProfile());
    act(() => {
      first.result.current.setters.setCurrentSaddleHeightMm(742);
      first.result.current.setters.setCurrentBarWidthMm(420);
    });
    first.unmount();
    const second = renderHook(() => useRiderProfile());
    expect(second.result.current.values.currentSaddleHeightMm).toBe(742);
    expect(second.result.current.values.currentBarWidthMm).toBe(420);
  });

  it('should keep null for profiles saved before the current setup existed', () => {
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify({ inseamMm: 800 }));
    const { result } = renderHook(() => useRiderProfile());
    expect(result.current.values.currentSaddleHeightMm).toBeNull();
    expect(result.current.values.inseamMm).toBe(800);
  });

  it('should toggle a pain on and off', () => {
    const { result } = renderHook(() => useRiderProfile());
    act(() => result.current.setters.togglePain('neck_pain'));
    expect(result.current.values.currentPains).toEqual(['neck_pain']);
    act(() => result.current.setters.togglePain('neck_pain'));
    expect(result.current.values.currentPains).toEqual([]);
  });

  it('should show the saved status after a manual save and clear it later', async () => {
    const { result } = renderHook(() => useRiderProfile());
    act(() => result.current.save());
    expect(result.current.saveStatus).toBe('saved');
  });

  describe('Epic 11: memoized coordinates and save status', () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should keep the same coordinates object when an unrelated value changes and a new one when the inseam changes', () => {
      const { result } = renderHook(() => useRiderProfile());
      const before = result.current.coordinates;
      act(() => result.current.setters.setAcromionWidthMm(400));
      expect(result.current.coordinates).toBe(before);
      act(() => result.current.setters.setInseamMm(860));
      expect(result.current.coordinates).not.toBe(before);
      expect(result.current.coordinates.saddle.heightAlongTubeMm).toBe(759);
    });

    it('should report a saved status that clears itself after about four seconds', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useRiderProfile());
      act(() => result.current.save());
      expect(result.current.saveStatus).toBe('saved');
      act(() => vi.advanceTimersByTime(3900));
      expect(result.current.saveStatus).toBe('saved');
      act(() => vi.advanceTimersByTime(200));
      expect(result.current.saveStatus).toBeNull();
    });

    it('should report an error status when the storage write fails and allow dismissing it', () => {
      const { result } = renderHook(() => useRiderProfile());
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      act(() => result.current.save());
      expect(result.current.saveStatus).toBe('error');
      act(() => result.current.dismissSaveStatus());
      expect(result.current.saveStatus).toBeNull();
    });
  });
});
