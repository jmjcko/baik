import { describe, it, expect } from 'vitest';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { passportToProfile, profileToPassport, rowToPassport, passportToRow } from '../mappers';
import { parsePassport } from '../parse';
import { activeRiderOf } from '../riders';

const coordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });
const measured = { ...DEFAULT_PROFILE, inseamMm: 860, heightCm: 181, acromionWidthMm: 390 };

/** BUG-015: the mark "the setup guide was finished" must live in the account with the rider, not only in the browser. */
describe('the setup mark of a rider in the passport', () => {
  it('should be stored with the rider and come back with the profile values', () => {
    const passport = profileToPassport({ ...DEFAULT_PROFILE, setupDone: true }, coordinates);
    expect(activeRiderOf(passport).setupDone).toBe(true);
    expect(passportToProfile(passport).setupDone).toBe(true);
  });

  it('should not write a mark for a rider who did not finish, and read that as not finished', () => {
    const passport = profileToPassport(DEFAULT_PROFILE, coordinates);
    expect(activeRiderOf(passport)).not.toHaveProperty('setupDone');
    expect(passportToProfile(passport).setupDone).toBe(false);
  });

  it('should survive the round trip through the row of the account table', () => {
    const row = passportToRow('u1', profileToPassport({ ...DEFAULT_PROFILE, setupDone: true }, coordinates));
    expect(passportToProfile(rowToPassport(row) as NonNullable<ReturnType<typeof rowToPassport>>).setupDone).toBe(true);
  });

  it('should count a stored rider without a mark as finished when height, inseam and shoulders were measured (an account made before the mark existed)', () => {
    const stored = JSON.parse(JSON.stringify(profileToPassport(measured, coordinates)));
    delete stored.riders[0].setupDone;
    expect(activeRiderOf(parsePassport(stored) as NonNullable<ReturnType<typeof parsePassport>>).setupDone).toBe(true);
  });

  it('should leave a stored rider with the default body, or with only some of it measured, as not finished', () => {
    for (const body of [DEFAULT_PROFILE, { ...DEFAULT_PROFILE, heightCm: 181 }, { ...DEFAULT_PROFILE, heightCm: 181, inseamMm: 860 }]) {
      const stored = JSON.parse(JSON.stringify(profileToPassport(body, coordinates)));
      expect(activeRiderOf(parsePassport(stored) as NonNullable<ReturnType<typeof parsePassport>>).setupDone).toBeUndefined();
    }
  });

  it('should ignore a mark that is not a plain true', () => {
    const stored = JSON.parse(JSON.stringify(profileToPassport(DEFAULT_PROFILE, coordinates)));
    stored.riders[0].setupDone = 'yes';
    expect(activeRiderOf(parsePassport(stored) as NonNullable<ReturnType<typeof parsePassport>>).setupDone).toBeUndefined();
  });
});
