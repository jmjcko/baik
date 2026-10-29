import { describe, it, expect } from 'vitest';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { DEFAULT_CARE, type BikeCare } from '@/types/maintain';
import { addGarageBike, switchActiveBike } from '../garage';
import { passportToProfile, profileToPassport } from '../mappers';
import { parseCare } from '../parseCare';
import { parsePassport } from '../parse';

const coordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });
const done: BikeCare = { nodes: { 1: 'pass', 2: 'warn', 3: 'unchecked', 4: 'pass', 5: 'fail' }, inspectedAt: '2026-10-29', chainWearPct: 0.6, drivetrain: '8-10', trainer: true, barTapeAt: '2026-03-01' };

describe('the care of a bike in the passport', () => {
  it('should store the care with the active bike and read it back, through the parser too', () => {
    const passport = profileToPassport({ ...DEFAULT_PROFILE, care: done }, coordinates);
    expect(passport.bikes[0].care).toEqual(done);
    expect(passportToProfile(parsePassport(JSON.parse(JSON.stringify(passport)))!).care).toEqual(done);
  });

  it('should write nothing for a bike whose care was never touched', () => {
    expect(profileToPassport(DEFAULT_PROFILE, coordinates).bikes[0]).not.toHaveProperty('care');
    expect(passportToProfile(profileToPassport(DEFAULT_PROFILE, coordinates)).care).toEqual(DEFAULT_CARE);
  });

  it('should drop what is malformed and keep the rest', () => {
    expect(parseCare('nope')).toBeUndefined();
    expect(parseCare({ nodes: { 1: 'great', 2: 'fail' }, inspectedAt: '29.10.2026', chainWearPct: 9, drivetrain: '13', trainer: 'yes', barTapeAt: 5 })).toEqual({
      ...DEFAULT_CARE, nodes: { ...DEFAULT_CARE.nodes, 2: 'fail' },
    });
  });

  it('should keep the care of each garage bike apart when the active bike changes', () => {
    const first = profileToPassport({ ...DEFAULT_PROFILE, care: done }, coordinates);
    const added = addGarageBike(first, 'Trainer bike', 'b2', 'road', true)!;
    expect(passportToProfile(added).care).toEqual({ ...DEFAULT_CARE, trainer: true });
    const back = switchActiveBike(added, first.activeBikeId)!;
    expect(passportToProfile(back).care).toEqual(done);
  });

  it('should not mark a new bike as an indoor bike unless asked', () => {
    const added = addGarageBike(profileToPassport(DEFAULT_PROFILE, coordinates), 'Plain', 'b3')!;
    expect(added.bikes.find((bike) => bike.id === 'b3')).not.toHaveProperty('care');
  });
});
