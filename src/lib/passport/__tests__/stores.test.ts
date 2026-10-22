import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { RIDER_PROFILE_STORAGE_KEY } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { PASSPORT_STORAGE_KEY, clearLocalPassport, loadLocalPassport, removeLegacyProfile, saveLocalPassport } from '../localStore';
import { profileToPassport, passportToRow } from '../mappers';
import { fetchRemotePassport, saveRemotePassport, type PassportDatabase } from '../remoteStore';
import { decideMerge, isEmptyPassport, samePassportData } from '../merge';

const passport = (overrides = {}) => {
  const values = { ...DEFAULT_PROFILE, inseamMm: 850, ...overrides };
  return profileToPassport(values, deriveCoordinates(values));
};

describe('local store', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('should find nothing in an empty browser', () => {
    expect(loadLocalPassport()).toBeNull();
  });

  it('should store the passport in an envelope under the passport key and read it back', () => {
    expect(saveLocalPassport(passport())).toBe(true);
    const stored = JSON.parse(localStorage.getItem(PASSPORT_STORAGE_KEY)!);
    expect(PASSPORT_STORAGE_KEY).toBe('baik_rider_passport');
    expect(stored).toMatchObject({ version: 1, passport: { discipline: 'road' } });
    expect(typeof stored.savedAt).toBe('string');
    expect(loadLocalPassport()).toEqual({ passport: passport(), fromLegacy: false });
  });

  it.each([['not json'], [JSON.stringify({ version: 2, passport: {} })], [JSON.stringify({ version: 1, passport: { discipline: 'ebike' } })], ['null']])(
    'should ignore a stored value that cannot be used: %s',
    (raw) => {
      localStorage.setItem(PASSPORT_STORAGE_KEY, raw);
      expect(loadLocalPassport()).toBeNull();
    }
  );

  it('should move the profile of earlier versions into a passport, filling what it lacks from the defaults', () => {
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify({ inseamMm: 900, ridingStyle: 'race', currentPains: ['neck_pain'], currentSaddleHeightMm: 755 }));
    const loaded = loadLocalPassport();
    expect(loaded?.fromLegacy).toBe(true);
    expect(loaded?.passport.anatomy).toMatchObject({ inseamMm: 900, acromionWidthMm: 420, heightCm: 178 });
    expect(loaded?.passport.postureStyle).toBe('race');
    expect(loaded?.passport.symptoms).toEqual(['neck_pain']);
    expect(loaded?.passport.bikes[0].components?.saddleHeightMm).toBe(755);
  });

  it('should prefer the passport over the legacy profile and refuse an implausible legacy profile', () => {
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify({ inseamMm: 900 }));
    saveLocalPassport(passport());
    expect(loadLocalPassport()?.fromLegacy).toBe(false);
    localStorage.clear();
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify({ inseamMm: 450 }));
    expect(loadLocalPassport()).toBeNull();
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, 'garbage');
    expect(loadLocalPassport()).toBeNull();
  });

  it('should report a failing storage and clear every copy, including the legacy profile', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(saveLocalPassport(passport())).toBe(false);
    vi.restoreAllMocks();
    saveLocalPassport(passport());
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, '{}');
    removeLegacyProfile();
    expect(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY)).toBeNull();
    localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, '{}');
    clearLocalPassport();
    expect(localStorage.getItem(PASSPORT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY)).toBeNull();
  });

  it('should not throw when the storage cannot be removed from', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => clearLocalPassport()).not.toThrow();
  });
});

describe('remote store', () => {
  const dbWith = (result: () => unknown): PassportDatabase =>
    ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => result() }) }), upsert: async () => result() }) }) as unknown as PassportDatabase;

  it('should return none, the passport, an unusable row or an error when reading', async () => {
    expect(await fetchRemotePassport(dbWith(() => ({ data: null, error: null })), 'u1')).toEqual({ status: 'ok', passport: null });
    expect(await fetchRemotePassport(dbWith(() => ({ data: passportToRow('u1', passport()), error: null })), 'u1')).toEqual({ status: 'ok', passport: passport() });
    expect(await fetchRemotePassport(dbWith(() => ({ data: { id: 'u1', discipline: 'ebike' }, error: null })), 'u1')).toEqual({ status: 'invalid' });
    expect(await fetchRemotePassport(dbWith(() => ({ data: null, error: { code: '42501' } })), 'u1')).toEqual({ status: 'error' });
    expect(await fetchRemotePassport(dbWith(() => { throw new Error('offline'); }), 'u1')).toEqual({ status: 'error' });
  });

  it('should write the own row with the id as conflict key and report failures as false', async () => {
    const upsert = vi.fn(async () => ({ error: null }));
    const db = { from: () => ({ upsert }) } as unknown as PassportDatabase;
    expect(await saveRemotePassport(db, 'u1', passport())).toBe(true);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1', discipline: 'road', posture_style: 'balanced' }), { onConflict: 'id' });
    expect(await saveRemotePassport(dbWith(() => ({ error: { code: '42501' } })), 'u1', passport())).toBe(false);
    expect(await saveRemotePassport(dbWith(() => { throw new Error('offline'); }), 'u1', passport())).toBe(false);
  });
});

describe('merge decision', () => {
  it('should know an empty passport from one with data', () => {
    expect(isEmptyPassport(passport({ inseamMm: DEFAULT_PROFILE.inseamMm }))).toBe(true);
    expect(isEmptyPassport(passport())).toBe(false);
    expect(isEmptyPassport({ ...passport({ inseamMm: DEFAULT_PROFILE.inseamMm }), gear: { jersey: 'M' } })).toBe(false);
    expect(isEmptyPassport({ ...passport({ inseamMm: DEFAULT_PROFILE.inseamMm }), bikes: [{ id: 'c1', kind: 'candidate' }] })).toBe(false);
  });

  it('should compare what the rider entered and not the calculated targets', () => {
    expect(samePassportData(passport(), { ...passport(), targets: null })).toBe(true);
    expect(samePassportData(passport(), passport({ inseamMm: 860 }))).toBe(false);
    expect(samePassportData(passport(), { ...passport(), gear: { a: 1 } })).toBe(false);
  });

  it.each([
    ['nothing anywhere', 'empty', null, 'nothing'],
    ['device data, empty account', 'data', null, 'upload-device'],
    ['empty device, account data', 'empty', 'data', 'use-account'],
    ['no device passport, account data', null, 'data', 'use-account'],
    ['the same data on both', 'data', 'data', 'use-account'],
    ['different data on both', 'data', 'other', 'ask'],
  ] as const)('should decide for %s', (_name, device, account, expected) => {
    const make = (kind: 'empty' | 'data' | 'other' | null) =>
      kind === null ? null : kind === 'empty' ? passport({ inseamMm: DEFAULT_PROFILE.inseamMm }) : passport({ inseamMm: kind === 'data' ? 850 : 870 });
    expect(decideMerge(make(device), account === null ? null : make(account))).toBe(expected);
  });
});
