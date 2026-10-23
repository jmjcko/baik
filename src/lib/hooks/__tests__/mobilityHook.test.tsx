import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient } from '@/test/fakeAuthClient';
import { storedPassport } from '@/test/storedPassport';
import { useRiderProfile } from '../useRiderProfile';

function setup() {
  const fake = fakeAuthClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider client={fake.client}>{children}</AuthProvider>;
  const view = renderHook(() => useRiderProfile(), { wrapper });
  return { fake, view, guest: async () => act(async () => fake.emit('INITIAL_SESSION', null)) };
}

describe('the mini-tests in the rider profile', () => {
  beforeEach(() => localStorage.clear());

  it('should raise the target handlebar stack by 18 mm for a low hamstring result and take it back when cleared', async () => {
    const { view, guest } = setup();
    await guest();
    const base = view.result.current.coordinates.cockpit.stackYMm;
    act(() => view.result.current.setters.setHamstringTest('low'));
    expect(view.result.current.coordinates.cockpit.stackYMm - base).toBe(18);
    act(() => view.result.current.setters.setHamstringTest('high'));
    expect(view.result.current.coordinates.cockpit.stackYMm).toBe(base);
    act(() => view.result.current.setters.setHamstringTest(null));
    expect(view.result.current.coordinates.cockpit.stackYMm).toBe(base);
  });

  it('should move the target setback 7 mm back for slumping and keep it for a stable rider', async () => {
    const { view, guest } = setup();
    await guest();
    const base = view.result.current.coordinates.saddle.setbackXMm;
    act(() => view.result.current.setters.setReleaseTest('slumping'));
    expect(view.result.current.coordinates.saddle.setbackXMm).toBe(base - 7);
    act(() => view.result.current.setters.setReleaseTest('stable'));
    expect(view.result.current.coordinates.saddle.setbackXMm).toBe(base);
  });

  it('should store the answers in the passport of the browser and show the adjusted targets in it', async () => {
    const { view, guest } = setup();
    await guest();
    const base = view.result.current.coordinates;
    act(() => view.result.current.setters.setHamstringTest('low'));
    act(() => view.result.current.setters.setReleaseTest('slumping'));
    const stored = storedPassport();
    expect(stored?.mobility).toEqual({ hamstring: 'low', release: 'slumping' });
    expect(stored?.targets?.cockpitStackMm).toBe(base.cockpit.stackYMm + 18);
    expect(stored?.targets?.saddleSetbackMm).toBe(base.saddle.setbackXMm - 7);
  });

  it('should give the answers back to a rider who comes again', async () => {
    const first = setup();
    await first.guest();
    act(() => first.view.result.current.setters.setReleaseTest('slumping'));
    first.view.unmount();
    const second = setup();
    await second.guest();
    expect(second.view.result.current.values.releaseTest).toBe('slumping');
  });
});
