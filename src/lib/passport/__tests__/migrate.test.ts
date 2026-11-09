import { describe, it, expect, beforeEach } from 'vitest';
import { migratePassport, isVersion2 } from '../migrate';
import { parsePassport } from '../parse';
import { loadLocalPassport, PASSPORT_STORAGE_KEY, PASSPORT_V1_BACKUP_KEY, saveLocalPassport } from '../localStore';
import { riderIn, targetsIn } from '@/test/storedPassport';

const anatomy = { inseamMm: 850, acromionWidthMm: 380, torsoLengthMm: 610, armLengthMm: 660, heightCm: 181, weightKg: 82, footLengthMm: 270 };
const targets = { saddleHeightMm: 742, saddleSetbackMm: -210, saddlePitchDeg: 0, cockpitStackMm: 567, cockpitReachMm: 384, handlebarWidthMm: 400, crankLengthMm: 172.5, cleatSetbackMm: { min: 0, max: 10 }, kbVersion: '1.4.0' };

/** A passport as the app stored it before Epic 43 (version 1): one body for the account, the posture and the targets at the top. */
const v1 = () => ({
  discipline: 'gravel',
  postureStyle: 'endurance',
  anatomy,
  symptoms: ['numb_hands', 'neck_pain'],
  targets,
  bikes: [
    { id: 'current', kind: 'current', name: 'Gravel', components: { crankLengthMm: 172.5 }, care: undefined },
    { id: 'second', kind: 'current', name: 'Road', discipline: 'road' },
    { id: 'c1', kind: 'candidate', name: 'Canyon' },
  ],
  activeBikeId: 'second',
  mobility: { hamstring: 'low', release: 'slumping' },
  gear: { jersey: 'M' },
});

describe('migration of a version 1 passport to version 2', () => {
  it('should turn the one body into the rider "me" with the pains and the mini-tests, losing none of it', () => {
    const passport = parsePassport(v1());
    expect(passport?.riders).toEqual([{ id: 'me', name: null, anatomy, symptoms: ['numb_hands', 'neck_pain'], mobility: { hamstring: 'low', release: 'slumping' }, setupDone: true }]);
    expect(passport?.gear).toEqual({ jersey: 'M' });
    expect(passport?.discipline).toBe('gravel');
  });

  it('should give every garage bike the rider "me" and the posture of the passport, and the targets to the active bike only', () => {
    const passport = parsePassport(v1());
    expect(passport?.bikes.map((bike) => [bike.id, bike.primaryRiderId, bike.ridingStyle])).toEqual([['current', 'me', 'endurance'], ['second', 'me', 'endurance'], ['c1', undefined, undefined]]);
    expect(passport?.activeBikeId).toBe('second');
    expect(targetsIn(passport)).toEqual(targets);
    expect(passport?.bikes[0].targets).toBeUndefined();
  });

  it('should be idempotent: a version 2 document comes back as it is, and migrating twice gives the same document', () => {
    const once = migratePassport(v1());
    expect(isVersion2(once)).toBe(true);
    expect(migratePassport(once)).toEqual(once);
    expect(parsePassport(once)).toEqual(parsePassport(v1()));
    expect(parsePassport(JSON.parse(JSON.stringify(parsePassport(v1()))))).toEqual(parsePassport(v1()));
  });

  it('should put the targets on the first garage bike when the stored active id is stale', () => {
    const passport = parsePassport({ ...v1(), activeBikeId: 'gone' });
    expect(passport?.activeBikeId).toBe('current');
    expect(passport?.bikes[0].targets).toEqual(targets);
  });

  it('should still refuse a version 1 document with an unknown posture, an implausible body or an unknown discipline', () => {
    expect(parsePassport({ ...v1(), postureStyle: 'sprint' })).toBeNull();
    expect(parsePassport({ ...v1(), anatomy: { ...anatomy, inseamMm: 5 } })).toBeNull();
    expect(parsePassport({ ...v1(), discipline: 'unicycle' })).toBeNull();
  });

  it('should keep a rider without mini-tests free of a mobility part', () => {
    const { mobility: _mobility, ...rest } = v1();
    void _mobility;
    expect(riderIn(parsePassport(rest))).not.toHaveProperty('mobility');
  });
});

describe('the browser keeps the version 1 document once, when it is read', () => {
  beforeEach(() => localStorage.clear());

  it('should read a stored version 1 envelope as version 2 and keep the original under the backup key', () => {
    const raw = JSON.stringify({ version: 1, savedAt: '2026-10-30T10:00:00Z', passport: v1() });
    localStorage.setItem(PASSPORT_STORAGE_KEY, raw);
    const loaded = loadLocalPassport();
    expect(loaded?.fromLegacy).toBe(false);
    expect(loaded?.passport.riders).toHaveLength(1);
    expect(localStorage.getItem(PASSPORT_V1_BACKUP_KEY)).toBe(raw);
  });

  it('should never overwrite the first backup, and write version 2 over the passport key afterwards', () => {
    const raw = JSON.stringify({ version: 1, savedAt: '2026-10-30T10:00:00Z', passport: v1() });
    localStorage.setItem(PASSPORT_STORAGE_KEY, raw);
    const loaded = loadLocalPassport();
    saveLocalPassport(loaded!.passport);
    expect(JSON.parse(localStorage.getItem(PASSPORT_STORAGE_KEY)!).version).toBe(2);
    expect(loadLocalPassport()?.passport).toEqual(loaded?.passport);
    expect(localStorage.getItem(PASSPORT_V1_BACKUP_KEY)).toBe(raw);
  });

  it('should not write a backup for a version 2 document', () => {
    const loaded = parsePassport(v1())!;
    saveLocalPassport(loaded);
    loadLocalPassport();
    expect(localStorage.getItem(PASSPORT_V1_BACKUP_KEY)).toBeNull();
  });
});
