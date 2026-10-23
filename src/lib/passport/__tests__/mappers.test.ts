import { describe, it, expect } from 'vitest';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/hooks/useRiderProfile';
import { KB_VERSION } from '@/lib/engines/baikfit/kbRules';
import { buildTargetsSnapshot, passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';

const values: ProfileValues = {
  inseamMm: 850, torsoLengthMm: 610, armLengthMm: 660, acromionWidthMm: 380, heightCm: 181, crankLengthMm: 172.5, riderWeightKg: 75,
  currentSaddleHeightMm: 720, currentBarWidthMm: 420, discipline: 'gravel', ridingStyle: 'endurance', currentPains: ['numb_hands', 'front_knee'], stockBike: null, lastDiagnosis: null, hamstringTest: null, releaseTest: null,
};
const coordinates = computeBikeFitCoordinates({ inseamMm: 850, ridingDiscipline: 'gravel' });

describe('targets snapshot', () => {
  it('should hold the calculated targets with the KB version', () => {
    expect(buildTargetsSnapshot(values, coordinates)).toEqual({
      saddleHeightMm: 751, saddleSetbackMm: coordinates.saddle.setbackXMm, saddlePitchDeg: 2,
      cockpitStackMm: coordinates.cockpit.stackYMm, cockpitReachMm: coordinates.cockpit.reachXMm,
      handlebarWidthMm: 380, crankLengthMm: 165, cleatSetbackMm: { min: 10, max: 17 }, kbVersion: KB_VERSION,
    });
    expect(KB_VERSION).toBe('1.3.0');
  });
});

describe('profile and passport', () => {
  it('should put the wizard values into the passport with the current bike as the first bike', () => {
    const passport = profileToPassport(values, coordinates);
    expect(passport.discipline).toBe('gravel');
    expect(passport.postureStyle).toBe('endurance');
    expect(passport.anatomy).toEqual({ inseamMm: 850, acromionWidthMm: 380, torsoLengthMm: 610, armLengthMm: 660, heightCm: 181, weightKg: 75 });
    expect(passport.symptoms).toEqual(['numb_hands', 'front_knee']);
    expect(passport.bikes[0]).toEqual({ id: 'current', kind: 'current', components: { saddleHeightMm: 720, handlebarWidthMm: 420, crankLengthMm: 172.5 } });
    expect(passport.targets?.saddleHeightMm).toBe(751);
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
      anatomy: { ...profileToPassport(values, coordinates).anatomy, footLengthMm: 270, inseamMm: 800 },
      gear: { jersey: 'M' },
      bikes: [{ id: 'old', kind: 'current' as const }, { id: 'c1', kind: 'candidate' as const, name: 'Canyon' }],
    };
    const next = profileToPassport({ ...values, inseamMm: 860 }, coordinates, previous);
    expect(next.anatomy.footLengthMm).toBe(270);
    expect(next.anatomy.inseamMm).toBe(860);
    expect(next.gear).toEqual({ jersey: 'M' });
    expect(next.bikes.map((b) => b.id)).toEqual(['current', 'old', 'c1']);
  });
});

describe('database row', () => {
  it('should map the passport to the columns of rider_profiles and back', () => {
    const passport = profileToPassport(values, coordinates);
    const row = passportToRow('user-1', passport);
    expect(row).toMatchObject({ id: 'user-1', discipline: 'gravel', posture_style: 'endurance', symptoms: ['numb_hands', 'front_knee'], gear: {} });
    expect(row).not.toHaveProperty('created_at');
    expect(rowToPassport(JSON.parse(JSON.stringify(row)))).toEqual(passport);
  });

  it('should refuse unusable rows', () => {
    expect(rowToPassport(null)).toBeNull();
    expect(rowToPassport('x')).toBeNull();
    expect(rowToPassport({ id: 'u', discipline: 'ebike', posture_style: 'race', anatomy: {} })).toBeNull();
  });
});
