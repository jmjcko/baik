import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { passportToProfile, profileToPassport } from '../mappers';
import { addRider, activeRiderOf, riderSummaries, assignBikeRider, bikesOfRider, canRemoveRider, removeRider, renameRider, riderOfBike, switchActiveRider, MAX_RIDERS } from '../riders';
import { addGarageBike, activeBikeOf } from '../garage';
import { decideMerge, isEmptyPassport, samePassportData } from '../merge';
import { parsePassport } from '../parse';
import { passportToRow, rowToPassport } from '../mappers';
import type { RiderPassport } from '../types';

const one = (): RiderPassport => profileToPassport(DEFAULT_PROFILE, deriveCoordinates(DEFAULT_PROFILE));
const wife = { riderId: 'r2', name: 'Eva', bikeId: 'b2', bikeName: 'Gravel Evy', discipline: 'gravel' as const };
const two = (): RiderPassport => addRider(one(), wife)!;

describe('the riders of the account', () => {
  it('should start with one rider "me" (name null) who owns the first bike', () => {
    const passport = one();
    expect(passport.riders).toHaveLength(1);
    expect(passport.riders[0]).toMatchObject({ id: 'me', name: null });
    expect(activeBikeOf(passport)?.primaryRiderId).toBe('me');
  });

  it('should add a rider with the first bike of that rider, which becomes the active bike and so the active rider', () => {
    const passport = two();
    expect(passport.riders.map((rider) => rider.id)).toEqual(['me', 'r2']);
    expect(activeBikeOf(passport)).toMatchObject({ id: 'b2', primaryRiderId: 'r2', discipline: 'gravel' });
    expect(activeRiderOf(passport).id).toBe('r2');
    expect(passport.discipline).toBe('gravel');
  });

  it.each([['an empty name', { ...wife, name: '  ' }], ['a name that is too long', { ...wife, name: 'x'.repeat(81) }], ['an empty bike name', { ...wife, bikeName: '' }], ['a repeated rider id', { ...wife, riderId: 'me' }], ['a repeated bike id', { ...wife, bikeId: 'current' }]])('should refuse %s', (_label, input) => {
    expect(addRider(one(), input)).toBeNull();
  });

  it('should refuse a name that another rider has (whatever the case) and a full account', () => {
    expect(addRider(two(), { ...wife, riderId: 'r3', bikeId: 'b3', name: 'EVA' })).toBeNull();
    let full: RiderPassport | null = one();
    for (let i = 1; i < MAX_RIDERS; i++) full = addRider(full!, { riderId: `r${i}`, name: `R${i}`, bikeId: `b${i}`, bikeName: 'Bike', discipline: 'road' });
    expect(full?.riders).toHaveLength(MAX_RIDERS);
    expect(addRider(full!, { riderId: 'rx', name: 'Extra', bikeId: 'bx', bikeName: 'Bike', discipline: 'road' })).toBeNull();
  });

  it('should write the wizard values to the active rider only and keep the body of the other rider', () => {
    const passport = two();
    const edited = profileToPassport({ ...passportToProfile(passport), heightCm: 165, riderWeightKg: 58, currentPains: ['neck_pain'] }, deriveCoordinates(DEFAULT_PROFILE), passport);
    expect(edited.riders.find((rider) => rider.id === 'r2')).toMatchObject({ anatomy: { heightCm: 165, weightKg: 58 }, symptoms: ['neck_pain'] });
    expect(edited.riders.find((rider) => rider.id === 'me')).toEqual(passport.riders[0]);
    expect(edited.riders.find((rider) => rider.id === 'me')?.anatomy.heightCm).toBe(DEFAULT_PROFILE.heightCm);
  });

  it('should compose the values of the pair: the body of the rider of the active bike and the posture of that bike', () => {
    const passport = switchActiveRider(two(), 'me')!;
    expect(passportToProfile(passport)).toMatchObject({ heightCm: DEFAULT_PROFILE.heightCm, riderWeightKg: DEFAULT_PROFILE.riderWeightKg });
    const eva = profileToPassport({ ...passportToProfile(two()), riderWeightKg: 58, ridingStyle: 'race' }, deriveCoordinates(DEFAULT_PROFILE), two());
    expect(passportToProfile(eva)).toMatchObject({ riderWeightKg: 58, ridingStyle: 'race' });
    expect(passportToProfile(switchActiveRider(eva, 'me')!).ridingStyle).toBe('balanced');
  });

  it('should keep the targets with the bike of the pair', () => {
    const passport = profileToPassport({ ...passportToProfile(two()), inseamMm: 780 }, deriveCoordinates({ ...DEFAULT_PROFILE, inseamMm: 780 }), two());
    expect(activeBikeOf(passport)?.targets).toBeDefined();
    expect(passport.bikes.find((bike) => bike.id === 'current')?.targets).toBeDefined();
    expect(activeBikeOf(passport)?.targets).not.toEqual(passport.bikes.find((bike) => bike.id === 'current')?.targets);
  });

  it('should rename a rider, refuse an empty or repeated name, and refuse an unknown rider', () => {
    expect(renameRider(two(), 'r2', 'Eva N.')?.riders[1].name).toBe('Eva N.');
    expect(renameRider(two(), 'me', 'Jan')?.riders[0].name).toBe('Jan');
    expect(renameRider(two(), 'r2', ' ')).toBeNull();
    expect(renameRider(two(), 'me', 'eva')).toBeNull();
    expect(renameRider(two(), 'nobody', 'X')).toBeNull();
  });

  it('should switch the active rider to the active or first bike of that rider, and refuse a rider without a bike', () => {
    const passport = addGarageBike(two(), 'Eva road', 'b3', 'road', false, 'r2')!;
    expect(bikesOfRider(passport, 'r2').map((bike) => bike.id)).toEqual(['b2', 'b3']);
    const mine = switchActiveRider(passport, 'me')!;
    expect(mine.activeBikeId).toBe('current');
    expect(switchActiveRider(mine, 'r2')?.activeBikeId).toBe('b2');
    expect(switchActiveRider({ ...passport, riders: [...passport.riders, { id: 'r9', name: 'Kid', anatomy: passport.riders[0].anatomy, symptoms: [] }] }, 'r9')).toBeNull();
  });

  it('should give a new bike to the rider of the active bike unless another rider is named', () => {
    const passport = two();
    expect(activeBikeOf(addGarageBike(passport, 'Another', 'b9')!)?.primaryRiderId).toBe('r2');
    expect(activeBikeOf(addGarageBike(passport, 'Mine', 'b9', 'road', false, 'me')!)?.primaryRiderId).toBe('me');
  });

  it('should assign a bike to another rider and refuse an unknown bike or rider', () => {
    const passport = assignBikeRider(two(), 'current', 'r2')!;
    expect(riderOfBike(passport, passport.bikes[0]).id).toBe('r2');
    expect(assignBikeRider(two(), 'nope', 'r2')).toBeNull();
    expect(assignBikeRider(two(), 'current', 'nope')).toBeNull();
  });

  it('should never remove the last rider; the bikes of a removed rider go to the chosen rider', () => {
    expect(canRemoveRider(one(), 'me')).toBe(false);
    expect(removeRider(one(), 'me', 'me')).toBeNull();
    const removed = removeRider(two(), 'r2', 'me')!;
    expect(removed.riders.map((rider) => rider.id)).toEqual(['me']);
    expect(removed.bikes.find((bike) => bike.id === 'b2')?.primaryRiderId).toBe('me');
    expect(removeRider(two(), 'r2', 'r2')).toBeNull();
    expect(removeRider(two(), 'r2', 'ghost')).toBeNull();
  });

  it('should repair a bike of a rider who is not there by giving it to the first rider when parsed', () => {
    const doc = JSON.parse(JSON.stringify(two()));
    doc.bikes[1].primaryRiderId = 'ghost';
    expect(parsePassport(doc)?.bikes[1].primaryRiderId).toBe('me');
  });

  it('should keep the riders through the row of the account and through the parser', () => {
    const passport = two();
    expect(rowToPassport(JSON.parse(JSON.stringify(passportToRow('u1', passport))))).toEqual(passport);
    expect(parsePassport(JSON.parse(JSON.stringify(passport)))).toEqual(passport);
  });

  it('should count a second rider as data when deciding about the merge, and tell two accounts with different riders apart', () => {
    expect(isEmptyPassport(one())).toBe(true);
    expect(isEmptyPassport(two())).toBe(false);
    expect(samePassportData(one(), two())).toBe(false);
    expect(samePassportData(two(), assignBikeRider(two(), 'b2', 'me')!)).toBe(false);
    expect(decideMerge(two(), one())).toBe('ask');
    expect(decideMerge(two(), null)).toBe('upload-device');
  });

  it('should list the riders in the order they were added whoever is active, with the bikes of each', () => {
    const passport = two();
    expect(riderSummaries(passport).map((rider) => [rider.id, rider.isActive, rider.bikeIds])).toEqual([['me', false, ['current']], ['r2', true, ['b2']]]);
    expect(riderSummaries(switchActiveRider(passport, 'me')!).map((rider) => [rider.id, rider.isActive])).toEqual([['me', true], ['r2', false]]);
  });
});
