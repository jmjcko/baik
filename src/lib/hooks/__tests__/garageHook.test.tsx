import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { storedPassport } from '@/test/storedPassport';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { useRiderProfile } from '../useRiderProfile';

function setup() {
  const fake = fakeAuthClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider client={fake.client}>{children}</AuthProvider>;
  const view = renderHook(() => useRiderProfile(), { wrapper });
  const guest = async () => act(async () => fake.emit('INITIAL_SESSION', null));
  return { fake, view, guest };
}

describe('garage of the rider profile', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('should list one active bike for a new rider', async () => {
    const { view, guest } = setup();
    await guest();
    const garage = view.result.current.garage();
    expect(garage?.activeBikeId).toBe('current');
    expect(garage?.bikes.map((bike) => bike.id)).toEqual(['current']);
  });

  it('should add a bike that becomes active with empty bike numbers, and keep the first bike as it was', async () => {
    const { view, guest } = setup();
    await guest();
    act(() => view.result.current.setters.setCurrentSaddleHeightMm(720));
    let added = false;
    act(() => { added = view.result.current.addBike('Gravel bike'); });
    expect(added).toBe(true);
    expect(view.result.current.values).toMatchObject({ currentSaddleHeightMm: null, stockBike: null, crankLengthMm: DEFAULT_PROFILE.crankLengthMm, inseamMm: DEFAULT_PROFILE.inseamMm });
    const garage = view.result.current.garage()!;
    expect(garage.bikes.map((bike) => [bike.name, bike.isActive])).toEqual([['Gravel bike', true], [null, false]]);
    expect(storedPassport()?.activeBikeId).toBe(garage.activeBikeId);
    expect(storedPassport()?.bikes.find((bike) => bike.id === 'current')?.components?.saddleHeightMm).toBe(720);
  });

  it('should switch back and show the numbers of that bike, and keep edits of the active bike with it', async () => {
    const { view, guest } = setup();
    await guest();
    act(() => view.result.current.setters.setCurrentSaddleHeightMm(720));
    act(() => { view.result.current.addBike('Gravel bike'); });
    act(() => view.result.current.setters.setCurrentSaddleHeightMm(690));
    act(() => { expect(view.result.current.switchBike('current')).toBe(true); });
    expect(view.result.current.values.currentSaddleHeightMm).toBe(720);
    expect(view.result.current.garage()?.activeBikeId).toBe('current');
    const gravel = storedPassport()!.bikes.find((bike) => bike.name === 'Gravel bike')!;
    expect(gravel.components?.saddleHeightMm).toBe(690);
    act(() => { view.result.current.switchBike(gravel.id); });
    expect(view.result.current.values.currentSaddleHeightMm).toBe(690);
    expect(storedPassport()?.activeBikeId).toBe(gravel.id);
  });

  it('should keep a road bike and a mountain bike apart: each has its own kind, factory setup and mountain bike numbers (BUG-013)', async () => {
    const { view, guest } = setup();
    await guest();
    const road = { source: 'seed' as const, bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };
    act(() => { view.result.current.setters.setDiscipline('road'); view.result.current.setters.setStockBike(road); });
    act(() => { view.result.current.addBike('My MTB', 'xc_mtb'); });
    expect(view.result.current.values).toMatchObject({ discipline: 'xc_mtb', stockBike: null });
    act(() => view.result.current.setters.setMtb({ style: 'trail', travelMm: 140 }));
    expect(view.result.current.garage()!.bikes.map((bike) => [bike.name, bike.discipline, bike.isActive])).toEqual([['My MTB', 'xc_mtb', true], [null, 'road', false]]);
    act(() => { view.result.current.switchBike('current'); });
    expect(view.result.current.values).toMatchObject({ discipline: 'road', stockBike: road });
    expect(storedPassport()?.discipline).toBe('road');
    const mtb = storedPassport()!.bikes.find((bike) => bike.name === 'My MTB')!;
    expect(mtb).toMatchObject({ discipline: 'xc_mtb', mtb: { style: 'trail', travelMm: 140 } });
    act(() => { view.result.current.switchBike(mtb.id); });
    expect(view.result.current.values).toMatchObject({ discipline: 'xc_mtb', stockBike: null, mtb: { style: 'trail', travelMm: 140 } });
    expect(storedPassport()?.discipline).toBe('xc_mtb');
  });

  it('should change the kind of the active bike only, when the rider picks another discipline in the wizard', async () => {
    const { view, guest } = setup();
    await guest();
    act(() => { view.result.current.addBike('Second', 'gravel'); });
    act(() => view.result.current.setters.setDiscipline('xc_mtb'));
    const kinds = () => Object.fromEntries(storedPassport()!.bikes.map((bike) => [bike.name ?? 'first', bike.discipline]));
    expect(kinds()).toEqual({ first: 'road', Second: 'xc_mtb' });
  });

  it('should refuse to switch to an unknown bike or to add an unusable one, and change nothing', async () => {
    const { view, guest } = setup();
    await guest();
    const before = view.result.current.values;
    let results: boolean[] = [];
    act(() => { results = [view.result.current.switchBike('nope'), view.result.current.addBike('   ')]; });
    expect(results).toEqual([false, false]);
    expect(view.result.current.values).toBe(before);
  });

  it('should not switch when the measurements on the screen cannot be stored', async () => {
    const { view, guest } = setup();
    await guest();
    act(() => { view.result.current.addBike('Gravel bike'); });
    act(() => view.result.current.setters.setInseamMm(5));
    let switched = true;
    act(() => { switched = view.result.current.switchBike('current'); });
    expect(switched).toBe(false);
    expect(view.result.current.garage()).toBeNull();
  });

  it('should store the garage in the account after a short delay, the active bike marked, without a new column', async () => {
    const { fake, view } = setup();
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', riderSession));
    vi.useFakeTimers();
    act(() => { view.result.current.addBike('Gravel bike'); });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    const row = fake.database.rows.get('u1') as { bikes: Array<{ id: string; name?: string; active?: boolean }> };
    expect(row.bikes.map((bike) => [bike.name, bike.active])).toEqual([[undefined, undefined], ['Gravel bike', true]]);
    expect(row).not.toHaveProperty('active_bike_id');
  });

  it('should rename a bike and keep the name after the numbers of that bike change', async () => {
    const { view, guest } = setup();
    await guest();
    let renamed = false;
    act(() => { renamed = view.result.current.renameBike('current', 'My summer road bike'); });
    expect(renamed).toBe(true);
    act(() => view.result.current.setters.setCurrentSaddleHeightMm(715));
    expect(view.result.current.garage()?.bikes[0].name).toBe('My summer road bike');
    expect(storedPassport()?.bikes[0]).toMatchObject({ name: 'My summer road bike', components: { saddleHeightMm: 715 } });
    let refused = true;
    act(() => { refused = view.result.current.renameBike('current', '  '); });
    expect(refused).toBe(false);
  });

  it('should delete a bike that is not active, and refuse the active bike and the only bike', async () => {
    const { view, guest } = setup();
    await guest();
    let results: boolean[] = [];
    act(() => { results.push(view.result.current.removeBike('current')); });
    expect(results).toEqual([false]);
    act(() => { view.result.current.addBike('Gravel bike'); });
    const activeId = view.result.current.garage()!.activeBikeId;
    act(() => { results = [view.result.current.removeBike(activeId), view.result.current.removeBike('current')]; });
    expect(results).toEqual([false, true]);
    expect(view.result.current.garage()?.bikes.map((bike) => bike.id)).toEqual([activeId]);
    expect(storedPassport()?.bikes.map((bike) => bike.id)).toEqual([activeId]);
  });

  it('should store a rename and a delete in the account like any other change', async () => {
    const { fake, view } = setup();
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', riderSession));
    vi.useFakeTimers();
    act(() => { view.result.current.addBike('Gravel bike'); view.result.current.renameBike('current', 'Road'); });
    act(() => { view.result.current.removeBike('current'); });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    const row = fake.database.rows.get('u1') as { bikes: Array<{ name?: string; active?: boolean }> };
    expect(row.bikes.map((bike) => [bike.name, bike.active])).toEqual([['Gravel bike', true]]);
  });

  it('should keep the day and the audit deltas of the last diagnosis with the active bike only', async () => {
    const { view, guest } = setup();
    await guest();
    act(() => view.result.current.setters.setLastDiagnosis({ at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: -10 }));
    act(() => { view.result.current.addBike('Gravel bike'); });
    expect(view.result.current.values.lastDiagnosis).toBeNull();
    expect(view.result.current.garage()?.bikes.find((bike) => bike.id === 'current')?.diagnosis).toEqual({ at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: -10 });
  });
});
