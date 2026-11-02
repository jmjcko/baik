import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';
import { riderIn } from '@/test/storedPassport';

const make = (over: Partial<ProfileValues> = {}) => {
  const values = { ...DEFAULT_PROFILE, ...over };
  return profileToPassport(values, deriveCoordinates(values));
};

describe('the mini-test answers in the passport', () => {
  it('should leave a rider without tests with no mobility part, and read them back as null', () => {
    const passport = make();
    expect(passport).not.toHaveProperty('mobility');
    expect(passportToProfile(passport)).toMatchObject({ hamstringTest: null, releaseTest: null });
  });

  it('should keep one or both answers through the passport, the parser and the profile', () => {
    for (const [values, mobility] of [[{ hamstringTest: 'low' as const }, { hamstring: 'low' }], [{ releaseTest: 'slumping' as const }, { release: 'slumping' }], [{ hamstringTest: 'high' as const, releaseTest: 'stable' as const }, { hamstring: 'high', release: 'stable' }]] as const) {
      const passport = make(values);
      expect(riderIn(passport)?.mobility).toEqual(mobility);
      expect(riderIn(parsePassport(JSON.parse(JSON.stringify(passport))))?.mobility).toEqual(mobility);
      expect(passportToProfile(passport)).toMatchObject({ hamstringTest: values.hamstringTest ?? null, releaseTest: values.releaseTest ?? null });
    }
  });

  it('should drop an answer that is not one of the known answers, and a rider without tests has none', () => {
    const base = JSON.parse(JSON.stringify(make()));
    const withMobility = (mobility: unknown) => ({ ...base, riders: [{ ...base.riders[0], mobility }] });
    expect(riderIn(parsePassport(withMobility({ hamstring: 'extreme', release: 'stable' })))?.mobility).toEqual({ release: 'stable' });
    for (const raw of [null, 'x', [], {}, { hamstring: 5 }]) expect(riderIn(parsePassport(withMobility(raw)))).not.toHaveProperty('mobility');
    expect(riderIn(parsePassport(base))).not.toHaveProperty('mobility');
  });

  it('should keep the answers with the rider inside the riders column and leave the gear column alone', () => {
    const passport = make({ hamstringTest: 'low', releaseTest: 'slumping' });
    const row = passportToRow('u1', passport);
    expect(row.riders).toEqual([expect.objectContaining({ mobility: { hamstring: 'low', release: 'slumping' } })]);
    expect(row.gear).toEqual({});
    expect(rowToPassport(JSON.parse(JSON.stringify(row)))).toEqual(passport);
  });

  it('should lift the answers out of the gear column when a row of version 1 is read', () => {
    const row = { ...passportToRow('u1', make()), riders: undefined, anatomy: make().riders[0].anatomy, symptoms: [], gear: { jersey: 'M', mobility: { hamstring: 'high' } } };
    const back = rowToPassport(JSON.parse(JSON.stringify(row)));
    expect(riderIn(back)?.mobility).toEqual({ hamstring: 'high' });
    expect(back?.gear).toEqual({ jersey: 'M' });
  });

  it('should keep the other gear of the rider through a row', () => {
    const passport = { ...make({ releaseTest: 'stable' }), gear: { jersey: 'M' } };
    expect(passportToRow('u1', passport).gear).toEqual({ jersey: 'M' });
    expect(rowToPassport(JSON.parse(JSON.stringify(passportToRow('u1', passport))))).toEqual(passport);
  });

  it('should keep the answers when the wizard values are written again over a previous passport', () => {
    const first = make({ hamstringTest: 'low' });
    const values = { ...passportToProfile(first), inseamMm: 860 };
    expect(riderIn(profileToPassport(values, deriveCoordinates(values), first))?.mobility).toEqual({ hamstring: 'low' });
  });
});
