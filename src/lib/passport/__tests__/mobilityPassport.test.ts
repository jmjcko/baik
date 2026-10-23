import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';

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
      expect(passport.mobility).toEqual(mobility);
      expect(parsePassport(JSON.parse(JSON.stringify(passport)))?.mobility).toEqual(mobility);
      expect(passportToProfile(passport)).toMatchObject({ hamstringTest: values.hamstringTest ?? null, releaseTest: values.releaseTest ?? null });
    }
  });

  it('should drop an answer that is not one of the known answers, and an older passport has none', () => {
    const base = JSON.parse(JSON.stringify(make()));
    expect(parsePassport({ ...base, mobility: { hamstring: 'extreme', release: 'stable' } })?.mobility).toEqual({ release: 'stable' });
    for (const raw of [null, 'x', [], {}, { hamstring: 5 }]) expect(parsePassport({ ...base, mobility: raw })).not.toHaveProperty('mobility');
    expect(parsePassport(base)).not.toHaveProperty('mobility');
  });

  it('should store the answers inside the existing gear column (no new column) and lift them out when the row is read', () => {
    const passport = make({ hamstringTest: 'low', releaseTest: 'slumping' });
    const row = passportToRow('u1', passport);
    expect(row.gear).toEqual({ mobility: { hamstring: 'low', release: 'slumping' } });
    expect(Object.keys(row)).not.toContain('mobility');
    const back = rowToPassport(JSON.parse(JSON.stringify(row)));
    expect(back).toEqual(passport);
    expect(back?.gear).toEqual({});
  });

  it('should keep the other gear of the rider next to the answers, and read a row without answers', () => {
    const passport = { ...make({ releaseTest: 'stable' }), gear: { jersey: 'M' } };
    expect(passportToRow('u1', passport).gear).toEqual({ jersey: 'M', mobility: { release: 'stable' } });
    expect(rowToPassport(JSON.parse(JSON.stringify(passportToRow('u1', passport))))?.gear).toEqual({ jersey: 'M' });
    const plain = make();
    expect(passportToRow('u1', plain).gear).toEqual({});
    expect(rowToPassport(JSON.parse(JSON.stringify(passportToRow('u1', plain))))).toEqual(plain);
  });

  it('should keep the answers when the wizard values are written again over a previous passport', () => {
    const first = make({ hamstringTest: 'low' });
    const values = { ...passportToProfile(first), inseamMm: 860 };
    expect(profileToPassport(values, deriveCoordinates(values), first).mobility).toEqual({ hamstring: 'low' });
  });
});
