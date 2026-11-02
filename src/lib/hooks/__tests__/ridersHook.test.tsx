import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient } from '@/test/fakeAuthClient';
import { storedPassport, riderIn } from '@/test/storedPassport';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { useRiderProfile } from '../useRiderProfile';

async function setup() {
  const fake = fakeAuthClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider client={fake.client}>{children}</AuthProvider>;
  const view = renderHook(() => useRiderProfile(), { wrapper });
  await act(async () => fake.emit('INITIAL_SESSION', null));
  return view;
}

describe('riders of the rider profile (Epic 43)', () => {
  beforeEach(() => localStorage.clear());

  it('should list the first rider as the only and active one, without a name of their own', async () => {
    const view = await setup();
    expect(view.result.current.riders()).toEqual({ riders: [{ id: 'me', name: null, isActive: true, bikeIds: ['current'] }], activeRiderId: 'me' });
  });

  it('should add a rider with the first bike, make them active and start their measurements from the defaults, keeping the first rider\'s body', async () => {
    const view = await setup();
    act(() => view.result.current.setters.setHeightCm(190));
    act(() => { expect(view.result.current.addRider('Eva', { bikeName: 'Eva gravel', discipline: 'gravel' })).toBe(true); });
    const { riders, activeRiderId } = view.result.current.riders()!;
    expect(riders.map((rider) => rider.name)).toEqual([null, 'Eva']);
    expect(activeRiderId).toBe(riders[1].id);
    expect(view.result.current.values.heightCm).toBe(DEFAULT_PROFILE.heightCm);
    expect(view.result.current.values.discipline).toBe('gravel');
    expect(storedPassport()?.riders).toHaveLength(2);
    expect(storedPassport()?.riders.find((rider) => rider.id === 'me')?.anatomy.heightCm).toBe(190);
  });

  it('should keep the body of each rider apart when the values are edited and the rider is switched', async () => {
    const view = await setup();
    act(() => view.result.current.setters.setRiderWeightKg(82));
    act(() => { view.result.current.addRider('Eva', { bikeName: 'Eva road', discipline: 'road' }); });
    act(() => view.result.current.setters.setRiderWeightKg(58));
    expect(view.result.current.values.riderWeightKg).toBe(58);
    act(() => { expect(view.result.current.switchRider('me')).toBe(true); });
    expect(view.result.current.values.riderWeightKg).toBe(82);
    expect(riderIn(storedPassport())?.id).toBe('me');
    act(() => { expect(view.result.current.switchRider(view.result.current.riders()!.riders.find((rider) => rider.name === 'Eva')!.id)).toBe(true); });
    expect(view.result.current.values.riderWeightKg).toBe(58);
  });

  it('should switch the rider when a bike of another rider is chosen', async () => {
    const view = await setup();
    act(() => { view.result.current.setters.setRiderWeightKg(82); });
    act(() => { view.result.current.addRider('Eva', { bikeName: 'Eva road', discipline: 'road' }); });
    act(() => view.result.current.setters.setRiderWeightKg(58));
    act(() => { expect(view.result.current.switchBike('current')).toBe(true); });
    expect(view.result.current.riders()?.riders.find((rider) => rider.isActive)?.name).toBeNull();
    expect(view.result.current.values.riderWeightKg).toBe(82);
  });

  it('should give a bike to another rider, rename a rider, and refuse what the passport refuses', async () => {
    const view = await setup();
    act(() => { view.result.current.addRider('Eva', { bikeName: 'Eva road', discipline: 'road' }); });
    const evaId = view.result.current.riders()!.riders.find((rider) => rider.name === 'Eva')!.id;
    act(() => { expect(view.result.current.assignBikeRider('current', evaId)).toBe(true); });
    expect(view.result.current.riders()?.riders.find((rider) => rider.id === evaId)?.bikeIds).toHaveLength(2);
    act(() => { expect(view.result.current.renameRider(evaId, 'Eva N.')).toBe(true); });
    act(() => { expect(view.result.current.renameRider(evaId, '  ')).toBe(false); });
    act(() => { expect(view.result.current.addRider('Eva N.', { bikeName: 'Bike', discipline: 'road' })).toBe(false); });
    act(() => { expect(view.result.current.removeRider('me', 'me')).toBe(false); });
  });

  it('should remove a rider and hand the bikes to the other rider', async () => {
    const view = await setup();
    act(() => { view.result.current.addRider('Eva', { bikeName: 'Eva road', discipline: 'road' }); });
    const evaId = view.result.current.riders()!.riders.find((rider) => rider.name === 'Eva')!.id;
    act(() => { expect(view.result.current.removeRider(evaId, 'me')).toBe(true); });
    const after = view.result.current.riders()!;
    expect(after.riders).toHaveLength(1);
    expect(after.riders[0].bikeIds).toHaveLength(2);
    expect(storedPassport()?.riders).toHaveLength(1);
  });

  it('should add a rider with the bike the account already has and open that bike with the new rider', async () => {
    const view = await setup();
    act(() => view.result.current.setters.setRiderWeightKg(82));
    act(() => { expect(view.result.current.addRider('Eva', { existingBikeId: 'current' })).toBe(true); });
    const { riders, activeRiderId } = view.result.current.riders()!;
    expect(riders.map((rider) => [rider.name, rider.bikeIds])).toEqual([[null, []], ['Eva', ['current']]]);
    expect(activeRiderId).toBe(riders[1].id);
    expect(view.result.current.values.riderWeightKg).toBe(DEFAULT_PROFILE.riderWeightKg);
    expect(storedPassport()?.bikes[0].primaryRiderId).toBe(riders[1].id);
    expect(storedPassport()?.riders.find((rider) => rider.id === 'me')?.anatomy.weightKg).toBe(82);
  });

  it('should give a bike to another rider from a rider card and let the active rider follow the active bike', async () => {
    const view = await setup();
    act(() => { view.result.current.addRider('Eva', { bikeName: 'Eva road', discipline: 'road' }); });
    act(() => { expect(view.result.current.assignBikeRider('current', view.result.current.riders()!.activeRiderId)).toBe(true); });
    expect(view.result.current.riders()?.riders.find((rider) => rider.id === 'me')?.bikeIds).toEqual([]);
  });
});
