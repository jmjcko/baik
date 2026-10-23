import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { storedPassport } from '@/test/storedPassport';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { PASSPORT_STORAGE_KEY, saveLocalPassport } from '@/lib/passport/localStore';
import { passportToRow, profileToPassport } from '@/lib/passport/mappers';
import { useRiderProfile } from '../useRiderProfile';

const passportFor = (overrides = {}) => {
  const values = { ...DEFAULT_PROFILE, ...overrides };
  return profileToPassport(values, deriveCoordinates(values));
};

/** Renders the profile hook inside a provider with a fake Supabase client; `fake.emit` plays the sign in events. */
function setup() {
  const fake = fakeAuthClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider client={fake.client}>{children}</AuthProvider>;
  const view = renderHook(() => useRiderProfile(), { wrapper });
  const signIn = async () => {
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', riderSession));
  };
  const accountHolds = (overrides: Record<string, unknown>) => fake.database.rows.set('u1', passportToRow('u1', passportFor(overrides)) as unknown as Record<string, unknown>);
  return { fake, view, signIn, accountHolds };
}

describe('passport sync of a guest and an account', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('should keep a guest in this browser: saved under the passport key and nothing sent to the network', async () => {
    const { fake, view } = setup();
    await act(async () => fake.emit('INITIAL_SESSION', null));
    act(() => view.result.current.setters.setInseamMm(860));
    expect(storedPassport()?.anatomy.inseamMm).toBe(860);
    expect(fake.database.from).not.toHaveBeenCalled();
  });

  it('should move the device data to an empty account at the first sign in and drop the local copy', async () => {
    saveLocalPassport(passportFor({ inseamMm: 860 }));
    const { fake, view, signIn } = setup();
    await signIn();
    expect(view.result.current.values.inseamMm).toBe(860);
    expect(fake.database.upsert).toHaveBeenCalledTimes(1);
    expect(fake.database.rows.get('u1')).toMatchObject({ id: 'u1', anatomy: expect.objectContaining({ inseamMm: 860 }) });
    expect(localStorage.getItem(PASSPORT_STORAGE_KEY)).toBeNull();
    expect(view.result.current.mergePrompt).toBeNull();
    expect(view.result.current.sync).toBe('idle');
  });

  it('should show the data of the account when the device holds nothing of its own', async () => {
    const { view, signIn, accountHolds, fake } = setup();
    accountHolds({ inseamMm: 870, discipline: 'gravel' });
    await signIn();
    expect(view.result.current.values).toMatchObject({ inseamMm: 870, discipline: 'gravel' });
    expect(fake.database.upsert).not.toHaveBeenCalled();
    expect(view.result.current.mergePrompt).toBeNull();
  });

  it('should not ask when the device and the account hold the same data', async () => {
    saveLocalPassport(passportFor({ inseamMm: 870 }));
    const { view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    expect(view.result.current.mergePrompt).toBeNull();
    expect(view.result.current.values.inseamMm).toBe(870);
  });

  it('should ask which data to keep when both differ, and keep the account when the rider says so', async () => {
    saveLocalPassport(passportFor({ inseamMm: 860 }));
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    expect(view.result.current.mergePrompt?.device.anatomy.inseamMm).toBe(860);
    expect(view.result.current.mergePrompt?.account.anatomy.inseamMm).toBe(870);
    expect(fake.database.upsert).not.toHaveBeenCalled();
    await act(async () => view.result.current.resolveMerge('account'));
    expect(view.result.current.mergePrompt).toBeNull();
    expect(view.result.current.values.inseamMm).toBe(870);
    expect(fake.database.upsert).not.toHaveBeenCalled();
    expect(localStorage.getItem(PASSPORT_STORAGE_KEY)).toBeNull();
  });

  it('should write the device data to the account when the rider chooses the device', async () => {
    saveLocalPassport(passportFor({ inseamMm: 860 }));
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    await act(async () => view.result.current.resolveMerge('device'));
    expect(view.result.current.values.inseamMm).toBe(860);
    expect(fake.database.rows.get('u1')).toMatchObject({ anatomy: expect.objectContaining({ inseamMm: 860 }) });
    expect(view.result.current.sync).toBe('idle');
  });

  it('should keep the choice open and report an error when writing the device data fails', async () => {
    saveLocalPassport(passportFor({ inseamMm: 860 }));
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    fake.database.upsert.mockResolvedValueOnce({ error: { code: '42501' } });
    await act(async () => view.result.current.resolveMerge('device'));
    expect(view.result.current.sync).toBe('error');
    expect(view.result.current.values.inseamMm).toBe(860);
  });

  it('should save a change of a signed in rider to the account after a short delay, once', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    vi.useFakeTimers();
    act(() => view.result.current.setters.setInseamMm(880));
    act(() => view.result.current.setters.setInseamMm(885));
    expect(fake.database.upsert).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(fake.database.upsert).toHaveBeenCalledTimes(1);
    expect(fake.database.rows.get('u1')).toMatchObject({ anatomy: expect.objectContaining({ inseamMm: 885 }) });
    expect(localStorage.getItem(PASSPORT_STORAGE_KEY)).toBeNull();
  });

  it('should keep a copy in this browser and report the error when the account cannot be written', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    vi.useFakeTimers();
    fake.database.upsert.mockResolvedValueOnce({ error: { code: '500' } });
    act(() => view.result.current.setters.setInseamMm(880));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(view.result.current.sync).toBe('error');
    expect(storedPassport()?.anatomy.inseamMm).toBe(880);
  });

  it('should report an error and upload nothing when the account cannot be read or holds an unusable row', async () => {
    const first = setup();
    first.fake.database.maybeSingle.mockResolvedValueOnce({ data: null, error: { code: '42501' } });
    await first.signIn();
    expect(first.view.result.current.sync).toBe('error');
    expect(first.fake.database.upsert).not.toHaveBeenCalled();
    first.view.unmount();
    const second = setup();
    second.fake.database.rows.set('u1', { id: 'u1', discipline: 'ebike' });
    await second.signIn();
    expect(second.view.result.current.sync).toBe('error');
    expect(second.fake.database.upsert).not.toHaveBeenCalled();
  });

  it('should write the account with an explicit save and show the result', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    await act(async () => view.result.current.applyValues({ ...view.result.current.values, inseamMm: 890 }));
    expect(fake.database.rows.get('u1')).toMatchObject({ anatomy: expect.objectContaining({ inseamMm: 890 }) });
    expect(view.result.current.saveStatus).toBe('saved');
    fake.database.upsert.mockResolvedValueOnce({ error: { code: '500' } });
    await act(async () => view.result.current.save());
    expect(view.result.current.saveStatus).toBe('error');
  });

  it('should remove every local copy and start from the defaults when the rider signs out', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870, currentPains: ['numb_hands'] });
    await signIn();
    expect(view.result.current.values.currentPains).toEqual(['numb_hands']);
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(view.result.current.values).toEqual(DEFAULT_PROFILE);
    expect(localStorage.getItem(PASSPORT_STORAGE_KEY)).not.toContain('numb_hands');
    expect(view.result.current.sync).toBe('idle');
  });

  it('should delete the stored data, return to the defaults and not write the defaults back', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870, currentPains: ['numb_hands'] });
    await signIn();
    const tick = view.result.current.savedTick;
    let ok = false;
    await act(async () => { ok = await view.result.current.erase(); });
    expect(ok).toBe(true);
    expect(fake.database.rows.has('u1')).toBe(false);
    expect(view.result.current.values).toEqual(DEFAULT_PROFILE);
    expect(view.result.current.savedTick).toBeGreaterThan(tick);
    vi.useFakeTimers();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(fake.database.upsert).not.toHaveBeenCalled();
    expect(fake.database.rows.has('u1')).toBe(false);
  });

  it('should delete the bikes that the rider shared together with the stored data, and keep the other riders\' bikes', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    fake.database.tables.bike_submissions = [{ id: 's1', user_id: 'u1' }, { id: 's2', user_id: 'u2' }];
    await signIn();
    await act(async () => { await view.result.current.erase(); });
    expect(fake.database.tables.bike_submissions.map((row) => row.id)).toEqual(['s2']);
    expect(fake.database.rows.has('u1')).toBe(false);
    expect(fake.database.submissionsRemove).toHaveBeenCalledWith('u1');
  });

  it('should change nothing when the shared bikes cannot be deleted, so the rider can try again', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    fake.database.tableError.current = { code: '42501' };
    let ok = true;
    await act(async () => { ok = await view.result.current.erase(); });
    expect(ok).toBe(false);
    expect(fake.database.rows.has('u1')).toBe(true);
    expect(view.result.current.values.inseamMm).toBe(870);
  });

  it('should still delete the stored data when the catalog tables do not exist yet (the migration was not run)', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    fake.database.tableError.current = { code: '42P01' };
    let ok = false;
    await act(async () => { ok = await view.result.current.erase(); });
    expect(ok).toBe(true);
    expect(fake.database.rows.has('u1')).toBe(false);
  });

  it('should store again after an erase as soon as the rider changes something', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    await act(async () => { await view.result.current.erase(); });
    vi.useFakeTimers();
    act(() => view.result.current.setters.setInseamMm(860));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(fake.database.rows.get('u1')).toMatchObject({ anatomy: expect.objectContaining({ inseamMm: 860 }) });
  });

  it('should change nothing when the delete fails', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    fake.database.removeError.current = { code: '42501' };
    let ok = true;
    await act(async () => { ok = await view.result.current.erase(); });
    expect(ok).toBe(false);
    expect(fake.database.rows.has('u1')).toBe(true);
    expect(view.result.current.values.inseamMm).toBe(870);
  });

  it('should not let a save that was already waiting bring the deleted row back', async () => {
    const { fake, view, signIn, accountHolds } = setup();
    accountHolds({ inseamMm: 870 });
    await signIn();
    vi.useFakeTimers();
    act(() => view.result.current.setters.setInseamMm(DEFAULT_PROFILE.inseamMm));
    await act(async () => { await view.result.current.erase(); });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(fake.database.rows.has('u1')).toBe(false);
  });

  it('should not save a value that cannot be stored, and report an explicit save of it as an error', async () => {
    const { view } = setup();
    act(() => view.result.current.setters.setInseamMm(450));
    expect(storedPassport()?.anatomy.inseamMm).not.toBe(450);
    act(() => view.result.current.save());
    expect(view.result.current.saveStatus).toBe('error');
  });
});
