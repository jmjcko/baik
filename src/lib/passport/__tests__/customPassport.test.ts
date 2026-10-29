import { describe, it, expect } from 'vitest';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { passportToProfile, profileToPassport } from '../mappers';
import { parsePassport } from '../parse';

const coordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });
const custom = { saddleSetbackMm: 180, stemLengthMm: 110, spacerStackMm: 0, saddleToBarDropMm: -10 };

describe('the measured setup in the passport', () => {
  it('should store the measured numbers of a modified bike with its mode and read them back', () => {
    const passport = profileToPassport({ ...DEFAULT_PROFILE, setupMode: 'custom', custom, currentSaddleHeightMm: 730 }, coordinates);
    expect(passport.bikes[0].setupMode).toBe('custom');
    expect(passport.bikes[0].components).toMatchObject({ saddleHeightMm: 730, ...custom });
    const back = passportToProfile(parsePassport(JSON.parse(JSON.stringify(passport)))!);
    expect(back.setupMode).toBe('custom');
    expect(back.custom).toEqual(custom);
  });

  it('should keep a series bike free of them, and read a bike stored before as a series bike with nothing measured', () => {
    const stock = profileToPassport({ ...DEFAULT_PROFILE, custom }, coordinates);
    expect(stock.bikes[0].setupMode).toBeUndefined();
    expect(stock.bikes[0].components).not.toHaveProperty('saddleSetbackMm');
    const back = passportToProfile(stock);
    expect(back.setupMode).toBe('stock');
    expect(back.custom).toEqual({ saddleSetbackMm: null, stemLengthMm: null, spacerStackMm: null, saddleToBarDropMm: null });
  });

  it('should drop stored numbers outside the plausible limits and an unknown mode', () => {
    const passport = profileToPassport({ ...DEFAULT_PROFILE, setupMode: 'custom', custom }, coordinates);
    const raw = JSON.parse(JSON.stringify(passport));
    raw.bikes[0].components.saddleSetbackMm = 9000;
    raw.bikes[0].components.stemLengthMm = 'long';
    raw.bikes[0].setupMode = 'tuned';
    const parsed = parsePassport(raw)!;
    expect(parsed.bikes[0].components).not.toHaveProperty('saddleSetbackMm');
    expect(parsed.bikes[0].components).not.toHaveProperty('stemLengthMm');
    expect(parsed.bikes[0].setupMode).toBeUndefined();
  });
});
