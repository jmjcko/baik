'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import type { RidingDiscipline } from '@/types/baikfit';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { clearLocalPassport, loadLocalPassport, removeLegacyProfile, saveLocalPassport } from '@/lib/passport/localStore';
import { addGarageBike, garageProfiles, removeGarageBike, renameGarageBike, switchActiveBike } from '@/lib/passport/garage';
import { passportToProfile, profileToPassport } from '@/lib/passport/mappers';
import { decideMerge } from '@/lib/passport/merge';
import { parsePassport } from '@/lib/passport/parse';
import { deleteRemotePassport, fetchRemotePassport, saveRemotePassport, type PassportDatabase } from '@/lib/passport/remoteStore';
import { deleteMySubmissions, type CatalogDatabase } from '@/lib/catalog/store';
import type { BikeProfile, RiderPassport } from '@/lib/passport/types';

export type SyncState = 'idle' | 'syncing' | 'error';

/** The device and the account both hold different data: the rider chooses which one to keep. */
export interface MergePrompt {
  device: RiderPassport;
  account: RiderPassport;
}

export type MergeChoice = 'device' | 'account';

export type SaveStatus = 'saved' | 'error';

const SAVE_STATUS_MS = 4000;
const REMOTE_SAVE_DELAY_MS = 800;

/** A value that survives renders without causing one; read and written through functions. */
function useLatest<T>(initial: T) {
  const ref = useRef(initial);
  return { get: () => ref.current, set: (value: T) => { ref.current = value; } };
}

/** What the hooks below share: the passport last known (its optional parts are kept), and the values as of now. */
function usePassportCore(values: ProfileValues) {
  const base = useRef<RiderPassport | null>(null);
  const latest = useRef(values);
  useEffect(() => {
    latest.current = values;
  });
  return {
    setBase: (passport: RiderPassport | null) => {
      base.current = passport;
    },
    latestValues: () => latest.current,
    /** The checked passport of a set of values, or null when they cannot be stored (for example an implausible inseam). */
    passportOf: (next: ProfileValues): RiderPassport | null => parsePassport(profileToPassport(next, deriveCoordinates(next), base.current)),
  };
}

type Core = ReturnType<typeof usePassportCore>;

/** Loads the guest's passport (or the legacy profile) from this browser once after mounting. */
function useLocalHydration(core: Core, loadValues: (values: ProfileValues) => void) {
  const [hydrated, setHydrated] = useState(false);
  /* The browser storage does not exist during server rendering, so it is read from an effect on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadLocalPassport();
    if (loaded) {
      core.setBase(loaded.passport);
      loadValues(passportToProfile(loaded.passport));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  return hydrated;
}

/** What the reconciliation does with its outcome (the hook supplies the state changes). */
interface Outcome {
  adopt: (passport: RiderPassport) => void;
  ask: (prompt: MergePrompt) => void;
  fail: () => void;
  empty: () => void;
  isCancelled: () => boolean;
}

/** Compares the device with the account at sign in and applies the decision (see decideMerge). */
async function reconcileAccount(db: PassportDatabase, userId: string, device: RiderPassport | null, outcome: Outcome): Promise<void> {
  const remote = await fetchRemotePassport(db, userId);
  if (outcome.isCancelled()) return;
  if (remote.status !== 'ok') return outcome.fail();
  const decision = decideMerge(device, remote.passport);
  if (decision === 'ask' && device && remote.passport) return outcome.ask({ device, account: remote.passport });
  if (decision === 'use-account' && remote.passport) return outcome.adopt(remote.passport);
  if (decision === 'upload-device' && device) return (await saveRemotePassport(db, userId, device)) ? outcome.adopt(device) : outcome.fail();
  outcome.empty();
}

/** State of the account side: sync state, whether the account was read, and the open question about which data to keep. */
function useAccountState() {
  const [sync, setSync] = useState<SyncState>('idle');
  const [ready, setReady] = useState(false);
  const [mergePrompt, setMergePrompt] = useState<MergePrompt | null>(null);
  const [savedTick, setSavedTick] = useState(0);
  const lastSynced = useLatest<string | null>(null);
  return { sync, setSync, ready, setReady, mergePrompt, setMergePrompt, lastSynced, savedTick, setSavedTick };
}

type AccountState = ReturnType<typeof useAccountState>;

/** Sign out: nothing of the account stays in this browser, the next rider starts from the defaults. */
function useSignOutReset(core: Core, state: AccountState, loadValues: (values: ProfileValues) => void) {
  const status = useAuth().status;
  const wasSignedIn = useLatest(false);
  useEffect(() => {
    if (status === 'authenticated') wasSignedIn.set(true);
    if (status !== 'anonymous' || !wasSignedIn.get()) return;
    wasSignedIn.set(false);
    clearLocalPassport();
    core.setBase(null);
    state.lastSynced.set(null);
    state.setReady(false);
    state.setMergePrompt(null);
    state.setSync('idle');
    loadValues(DEFAULT_PROFILE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
}

interface KeepContext {
  db: PassportDatabase | null;
  userId: string | null;
  state: AccountState;
  adopt: (passport: RiderPassport) => void;
}

/** The rider chose which data to keep: the device data is written to the account, the account data is loaded. */
async function keepChoice(choice: MergeChoice, { db, userId, state, adopt }: KeepContext): Promise<void> {
  const prompt = state.mergePrompt;
  if (!prompt || !userId || !db) return;
  state.setMergePrompt(null);
  state.setSync('syncing');
  if (choice === 'device' && !(await saveRemotePassport(db, userId, prompt.device))) return state.setSync('error');
  adopt(choice === 'device' ? prompt.device : prompt.account);
}

/** Reconciles the device with the account at sign in, and the other way round at sign out. */
function useAccountSync(core: Core, hydrated: boolean, loadValues: (values: ProfileValues) => void) {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const state = useAccountState();
  useSignOutReset(core, state, loadValues);

  /** The account is settled: no local copy stays, and autosave to the account may start. */
  const settle = () => {
    clearLocalPassport();
    state.setReady(true);
    state.setSync('idle');
  };

  /** The passport is now the one in the account: show it and remember it as synced. */
  const adopt = (passport: RiderPassport) => {
    core.setBase(passport);
    loadValues(passportToProfile(passport));
    state.lastSynced.set(JSON.stringify(core.passportOf(passportToProfile(passport))));
    settle();
  };

  /* Sign in: reconcile once per signed in user (the account is read from the network, so this is an effect). */
  useEffect(() => {
    const db = auth.getDatabase();
    if (!hydrated || auth.status !== 'authenticated' || !userId || !db) return;
    const controller = new AbortController();
    state.setSync('syncing');
    void reconcileAccount(db, userId, core.passportOf(core.latestValues()), {
      adopt, empty: settle, ask: state.setMergePrompt, fail: () => state.setSync('error'), isCancelled: () => controller.signal.aborted,
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, auth.status, userId]);

  const resolveMerge = (choice: MergeChoice) => keepChoice(choice, { db: auth.getDatabase(), userId, state, adopt });

  const markSaved = () => state.setSavedTick((tick) => tick + 1);
  return { sync: state.sync, setSync: state.setSync, ready: state.ready, mergePrompt: state.mergePrompt, resolveMerge, lastSynced: state.lastSynced, userId, savedTick: state.savedTick, markSaved };
}

type AccountSync = ReturnType<typeof useAccountSync>;

/** Saves every change: at once in this browser for a guest, after a short delay in the account for a signed in rider. */
function useAutosave(core: Core, hydrated: boolean, values: ProfileValues, account: AccountSync) {
  const auth = useAuth();
  useEffect(() => {
    if (!hydrated || account.mergePrompt) return;
    const passport = core.passportOf(values);
    if (!passport) return;
    if (auth.status === 'anonymous') {
      if (saveLocalPassport(passport)) removeLegacyProfile();
      return;
    }
    const db = auth.getDatabase();
    const serialized = JSON.stringify(passport);
    if (auth.status !== 'authenticated' || !account.ready || !account.userId || !db || serialized === account.lastSynced.get()) return;
    const timer = setTimeout(async () => {
      const ok = await saveRemotePassport(db, account.userId as string, passport);
      if (ok) {
        account.lastSynced.set(serialized);
        account.markSaved();
      } else saveLocalPassport(passport);
      account.setSync(ok ? 'idle' : 'error');
    }, REMOTE_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, hydrated, auth.status, account.ready, account.mergePrompt, account.userId]);
}

/**
 * Deletes the stored passport and starts again from the defaults. The defaults are marked as already synced, so the
 * autosave does not write them back: the row stays gone until the rider changes something.
 */
function useErase(core: Core, account: AccountSync, loadValues: (values: ProfileValues) => void) {
  const auth = useAuth();
  return async (): Promise<boolean> => {
    const db = auth.getDatabase();
    if (!db || !account.userId) return false;
    /* The numbers the rider shared go with the rest of the stored data (the approved catalog keeps its anonymous numbers). */
    if (!(await deleteMySubmissions(db as unknown as CatalogDatabase, account.userId)) || !(await deleteRemotePassport(db, account.userId))) return false;
    clearLocalPassport();
    core.setBase(null);
    account.lastSynced.set(JSON.stringify(core.passportOf(DEFAULT_PROFILE)));
    loadValues(DEFAULT_PROFILE);
    account.markSaved();
    return true;
  };
}

/** A new id for a garage bike (unique enough for one rider's garage; the passport refuses a repeated id). */
const newBikeId = (): string => `bike-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * The garage of the rider: the bikes with the active one first, and the two changes (switch, add). Both rewrite the
 * passport that is kept as the base and load the active bike's values; the autosave then stores them.
 */
function useGarage(core: Core, loadValues: (values: ProfileValues) => void, values: ProfileValues) {
  const change = (make: (current: RiderPassport) => RiderPassport | null): boolean => {
    const current = core.passportOf(core.latestValues());
    const next = current && make(current);
    if (!next) return false;
    core.setBase(next);
    loadValues(passportToProfile(next));
    return true;
  };
  return {
    /** The garage as of now (the active bike reflects the values of this render, not of the one before); empty when the values cannot be stored. */
    garage: (): { bikes: BikeProfile[]; activeBikeId: string } | null => {
      const current = core.passportOf(values);
      return current && { bikes: garageProfiles(current), activeBikeId: current.activeBikeId };
    },
    switchBike: (bikeId: string) => change((current) => switchActiveBike(current, bikeId)),
    addBike: (name: string, discipline?: RidingDiscipline) => change((current) => addGarageBike(current, name, newBikeId(), discipline)),
    renameBike: (bikeId: string, name: string) => change((current) => renameGarageBike(current, bikeId, name)),
    removeBike: (bikeId: string) => change((current) => removeGarageBike(current, bikeId)),
  };
}

/** The result of the last explicit save, shown as a toast and cleared after a few seconds. */
function useSaveResult() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const dismissSaveStatus = () => {
    clearTimeout(timer.current);
    setSaveStatus(null);
  };

  const report = (ok: boolean) => {
    clearTimeout(timer.current);
    setSaveStatus(ok ? 'saved' : 'error');
    timer.current = setTimeout(() => setSaveStatus(null), SAVE_STATUS_MS);
  };

  return { saveStatus, report, dismissSaveStatus };
}

/**
 * The rider's passport: kept in this browser for a guest (key `baik_rider_passport`, the legacy profile is moved
 * once), and in the account `rider_profiles` after signing in. At the first sign in the device data moves to an
 * empty account, or the rider chooses between the two. Signing out removes every local copy.
 */
export function useRiderPassport(values: ProfileValues, loadValues: (values: ProfileValues) => void) {
  const auth = useAuth();
  const core = usePassportCore(values);
  const hydrated = useLocalHydration(core, loadValues);
  const account = useAccountSync(core, hydrated, loadValues);
  const result = useSaveResult();
  const erase = useErase(core, account, loadValues);
  const garage = useGarage(core, loadValues, values);
  useAutosave(core, hydrated, values, account);

  /** Explicit save ("Use in my profile"): reports the result as a toast. */
  const persist = (next: ProfileValues) => {
    const passport = core.passportOf(next);
    const db = auth.getDatabase();
    if (!passport) return result.report(false);
    if (auth.status === 'authenticated' && account.ready && account.userId && db) {
      return void saveRemotePassport(db, account.userId, passport).then(result.report);
    }
    result.report(saveLocalPassport(passport));
  };

  return {
    saveStatus: result.saveStatus, dismissSaveStatus: result.dismissSaveStatus, persist, sync: account.sync, mergePrompt: account.mergePrompt,
    resolveMerge: account.resolveMerge, erase, savedTick: account.savedTick, ...garage,
  };
}
