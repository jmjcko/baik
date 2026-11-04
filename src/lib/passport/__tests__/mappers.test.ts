import { describe, it, expect } from 'vitest';
import { DEFAULT_MTB_SETUP } from '@/lib/engines/baikfit/mtb';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/hooks/useRiderProfile';
import { DEFAULT_CUSTOM_SETUP } from '@/lib/engines/baikfit/customSetup';
import { DEFAULT_CARE } from '@/types/maintain';
import { KB_VERSION } from '@/lib/engines/baikfit/kbRules';
import { buildTargetsSnapshot, passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';
import { activeBikeOf } from '../garage';
import { riderIn, targetsIn } from '@/test/storedPassport';

const values: ProfileValues = {
  inseamMm: 850, torsoLengthMm: 610, armLengthMm: 660, acromionWidthMm: 380, heightCm: 181, crankLengthMm: 172.5, riderWeightKg: 75,
  currentSaddleHeightMm: 720, currentBarWidthMm: 420, discipline: 'gravel', ridingStyle: 'endurance', currentPains: ['numb_hands', 'front_knee'], stockBike: null, lastDiagnosis: null, hamstringTest: null, releaseTest: null, mtb: DEFAULT_MTB_SETUP, setupMode: 'stock', custom: DEFAULT_CUSTOM_SETUP, care: DEFAULT_CARE,
};
const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'gravel' });

describe('targets snapshot', () => {
  it('should hold the calculated targets with the KB version', () => {
    expect(buildTargetsSnapshot(values, coordinates)).toEqual({
      saddleHeightMm: 751, saddleSetbackMm: coordinates.saddle.setbackXMm, saddlePitchDeg: 2,
      cockpitStackMm: coordinates.cockpit.stackYMm, cockpitReachMm: coordinates.cockpit.reachXMm,
      handlebarWidthMm: 380, crankLengthMm: 165, cleatSetbackMm: { min: 10, max: 17 }, kbVersion: KB_VERSION,
    });
    expect(KB_VERSION).toBe('1.5.0');
  });
});

describe('profile and passport', () => {
  it('should put the wizard values into the passport with the current bike as the first bike', () => {
    const passport = profileToPassport(values, coordinates);
    expect(passport.discipline).toBe('gravel');
    expect(activeBikeOf(passport)?.ridingStyle).toBe('endurance');
    expect(riderIn(passport)?.anatomy).toEqual({ inseamMm: 850, acromionWidthMm: 380, torsoLengthMm: 610, armLengthMm: 660, heightCm: 181, weightKg: 75 });
    expect(riderIn(passport)?.symptoms).toEqual(['numb_hands', 'front_knee']);
    expect(passport.bikes[0]).toEqual({ id: 'current', kind: 'current', primaryRiderId: 'me', ridingStyle: 'endurance', targets: expect.objectContaining({ saddleHeightMm: 751 }), discipline: 'gravel', components: { saddleHeightMm: 720, handlebarWidthMm: 420, crankLengthMm: 172.5 } });
    expect(targetsIn(passport)?.saddleHeightMm).toBe(751);
  });

  it('should give back exactly the wizard values (round trip), also through the parser', () => {
    const passport = profileToPassport(values, coordinates);
    expect(passportToProfile(passport)).toEqual(values);
    expect(passportToProfile(parsePassport(JSON.parse(JSON.stringify(passport)))!)).toEqual(values);
  });

  it('should keep not entered current values as null', () => {
    const back = passportToProfile(profileToPassport({ ...values, currentSaddleHeightMm: null, currentBarWidthMm: null }, coordinates));
    expect(back.currentSaddleHeightMm).toBeNull();
    expect(back.currentBarWidthMm).toBeNull();
  });

  it('should use the default crank when the passport has no current bike', () => {
    const passport = { ...profileToPassport(values, coordinates), bikes: [] };
    expect(passportToProfile(passport).crankLengthMm).toBe(DEFAULT_PROFILE.crankLengthMm);
    expect(passportToProfile(passport).currentSaddleHeightMm).toBeNull();
  });

  it('should keep optional measurements, gear, candidate bikes and the other garage bikes of the previous passport and write the active bike', () => {
    const previous = {
      ...profileToPassport(values, coordinates),
      riders: [{ ...profileToPassport(values, coordinates).riders[0], anatomy: { ...profileToPassport(values, coordinates).riders[0].anatomy, footLengthMm: 270, inseamMm: 800 } }],
      gear: { jersey: 'M' },
      bikes: [{ id: 'old', kind: 'current' as const }, { id: 'c1', kind: 'candidate' as const, name: 'Canyon' }],
    };
    const next = profileToPassport({ ...values, inseamMm: 860 }, coordinates, previous);
    expect(riderIn(next)?.anatomy.footLengthMm).toBe(270);
    expect(riderIn(next)?.anatomy.inseamMm).toBe(860);
    expect(next.gear).toEqual({ jersey: 'M' });
    expect(next.bikes.map((b) => b.id)).toEqual(['current', 'old', 'c1']);
  });
});

describe('database row', () => {
  it('should map the passport to the columns of rider_profiles and back', () => {
    const passport = profileToPassport(values, coordinates);
    const row = passportToRow('user-1', passport);
    expect(row).toMatchObject({ id: 'user-1', discipline: 'gravel', posture_style: 'endurance', anatomy: {}, symptoms: [], targets: null, gear: {} });
    expect(row.riders).toEqual([expect.objectContaining({ id: 'me', name: null, symptoms: ['numb_hands', 'front_knee'] })]);
    expect(row).not.toHaveProperty('created_at');
    expect(rowToPassport(JSON.parse(JSON.stringify(row)))).toEqual(passport);
  });

  it('should read a row of version 1 (no riders column) as one rider "me" with the posture and the targets on the active bike', () => {
    const v1 = { id: 'u', discipline: 'gravel', posture_style: 'race', anatomy: riderIn(profileToPassport(values, coordinates))?.anatomy, symptoms: ['neck_pain'], targets: targetsIn(profileToPassport(values, coordinates)), bikes: [{ id: 'current', kind: 'current', active: true }], gear: { mobility: { hamstring: 'low' } } };
    const passport = rowToPassport(v1);
    expect(passport?.riders).toEqual([expect.objectContaining({ id: 'me', name: null, symptoms: ['neck_pain'], mobility: { hamstring: 'low' } })]);
    expect(passport?.bikes[0]).toMatchObject({ primaryRiderId: 'me', ridingStyle: 'race', targets: expect.objectContaining({ saddleHeightMm: 751 }) });
    expect(passport?.gear).toEqual({});
  });

  it('should refuse unusable rows', () => {
    expect(rowToPassport(null)).toBeNull();
    expect(rowToPassport('x')).toBeNull();
    expect(rowToPassport({ id: 'u', discipline: 'unicycle', posture_style: 'race', anatomy: {} })).toBeNull();
  });
});
