import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { addGarageBike, activeBikeOf, canRemoveGarageBike, removeGarageBike, renameGarageBike, describeBike, garageOf, garageProfiles, MAX_BIKE_NAME_LENGTH, MAX_GARAGE_BIKES, switchActiveBike } from '../garage';
import { passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';
import type { RiderPassport } from '../types';

const seed = STOCK_BIKE_SPECS[0];
const size = Object.keys(seed.sizes)[0];
const stock = { source: 'seed' as const, bikeId: seed.id, size };
const make = (over: Partial<ProfileValues> = {}, previous?: RiderPassport | null) => {
  const values = { ...DEFAULT_PROFILE, ...over };
  return profileToPassport(values, deriveCoordinates(values), previous);
};

describe('garage of the passport', () => {
  it('should start with one bike, the bike of path A, which is the active one', () => {
    const passport = make({ currentSaddleHeightMm: 720 });
    expect(passport.activeBikeId).toBe('current');
    expect(garageOf(passport)).toHaveLength(1);
    expect(activeBikeOf(passport)?.components?.saddleHeightMm).toBe(720);
  });

  it('should add a named bike, make it active and keep the numbers of the first bike', () => {
    const first = make({ currentSaddleHeightMm: 720, crankLengthMm: 172.5 });
    const added = addGarageBike(first, '  Gravel bike  ', 'bike-2')!;
    expect(added.activeBikeId).toBe('bike-2');
    expect(added.bikes.map((bike) => [bike.id, bike.kind, bike.name])).toEqual([['current', 'current', undefined], ['bike-2', 'current', 'Gravel bike']]);
    const values = passportToProfile(added);
    expect([values.currentSaddleHeightMm, values.stockBike, values.crankLengthMm]).toEqual([null, null, DEFAULT_PROFILE.crankLengthMm]);
    expect(added.bikes[0].components?.saddleHeightMm).toBe(720);
  });

  it.each([['an empty name', ' ', 'x'], ['a name that is too long', 'x'.repeat(MAX_BIKE_NAME_LENGTH + 1), 'x'], ['an empty id', 'Name', ''], ['a repeated id', 'Name', 'current']])('should refuse %s', (_label, name, id) => {
    expect(addGarageBike(make(), name, id)).toBeNull();
  });

  it('should refuse a bike beyond the size of the garage', () => {
    let passport = make();
    for (let index = 1; index < MAX_GARAGE_BIKES; index++) passport = addGarageBike(passport, `Bike ${index}`, `b${index}`)!;
    expect(passport.bikes).toHaveLength(MAX_GARAGE_BIKES);
    expect(addGarageBike(passport, 'One too many', 'extra')).toBeNull();
  });

  it('should switch the active bike and load its own numbers, and write the numbers back to the right bike', () => {
    const first = make({ currentSaddleHeightMm: 720, stockBike: stock });
    const two = addGarageBike(first, 'Gravel', 'bike-2')!;
    const edited = make({ ...passportToProfile(two), currentSaddleHeightMm: 700 }, two);
    expect(edited.bikes.find((bike) => bike.id === 'bike-2')?.components?.saddleHeightMm).toBe(700);
    expect(edited.bikes.find((bike) => bike.id === 'current')?.components?.saddleHeightMm).toBe(720);
    const back = switchActiveBike(edited, 'current')!;
    expect(passportToProfile(back)).toMatchObject({ currentSaddleHeightMm: 720, stockBike: stock });
    expect(passportToProfile(switchActiveBike(back, 'bike-2')!).currentSaddleHeightMm).toBe(700);
  });

  it('should not switch to a bike that is not in the garage or is only a candidate', () => {
    const passport = { ...make(), bikes: [...make().bikes, { id: 'c1', kind: 'candidate' as const }] };
    expect(switchActiveBike(passport, 'missing')).toBeNull();
    expect(switchActiveBike(passport, 'c1')).toBeNull();
    expect(garageOf(passport)).toHaveLength(1);
  });

  it('should describe a factory bike by its brand, model, year and size and an own bike without them', () => {
    const passport = addGarageBike(make({ stockBike: stock }), 'Gravel', 'bike-2')!;
    const [active, factory] = garageProfiles(passport);
    expect(active).toMatchObject({ id: 'bike-2', name: 'Gravel', isStock: false, year: null, size: null, factoryName: null, isActive: true });
    expect(factory).toMatchObject({ id: 'current', isStock: true, year: seed.years[0], size, factoryName: `${seed.brand} ${seed.model}`, isActive: false });
    expect(describeBike({ id: 'x', kind: 'current', stock: { source: 'seed', bikeId: 'gone', size: 'M' } }, 'y')).toMatchObject({ isStock: false });
  });

  it('should keep the last diagnosis with its own bike', () => {
    const diagnosis = { at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: -10 };
    const first = make({ lastDiagnosis: diagnosis });
    const two = addGarageBike(first, 'Gravel', 'bike-2')!;
    expect(passportToProfile(two).lastDiagnosis).toBeNull();
    expect(garageProfiles(two).find((bike) => bike.id === 'current')?.diagnosis).toEqual(diagnosis);
    expect(passportToProfile(switchActiveBike(two, 'current')!).lastDiagnosis).toEqual(diagnosis);
  });
});

describe('renaming and deleting a garage bike', () => {
  const two = () => addGarageBike(make({ currentSaddleHeightMm: 720 }), 'Gravel', 'bike-2')!;

  it('should rename a bike, also the active one, and keep its numbers', () => {
    const renamed = renameGarageBike(two(), 'current', '  My summer road bike ')!;
    expect(renamed.bikes.find((bike) => bike.id === 'current')).toMatchObject({ name: 'My summer road bike', components: { saddleHeightMm: 720 } });
    expect(renamed.activeBikeId).toBe('bike-2');
    expect(garageProfiles(renamed).find((bike) => bike.id === 'bike-2')?.name).toBe('Gravel');
  });

  it('should keep the new name when the numbers of the active bike are written again', () => {
    const renamed = renameGarageBike(two(), 'bike-2', 'Winter gravel')!;
    const again = make({ ...passportToProfile(renamed), currentSaddleHeightMm: 690 }, renamed);
    expect(again.bikes.find((bike) => bike.id === 'bike-2')).toMatchObject({ name: 'Winter gravel', components: { saddleHeightMm: 690 } });
  });

  it.each([['an empty name', 'current', ' '], ['a name that is too long', 'current', 'x'.repeat(MAX_BIKE_NAME_LENGTH + 1)], ['an unknown bike', 'nope', 'Name']])('should refuse a rename with %s', (_label, id, name) => {
    expect(renameGarageBike(two(), id, name)).toBeNull();
  });

  it('should not rename a candidate bike', () => {
    const passport = { ...two(), bikes: [...two().bikes, { id: 'c1', kind: 'candidate' as const }] };
    expect(renameGarageBike(passport, 'c1', 'Name')).toBeNull();
  });

  it('should delete a bike that is not active and keep the others', () => {
    const passport = two();
    expect(canRemoveGarageBike(passport, 'current')).toBe(true);
    const left = removeGarageBike(passport, 'current')!;
    expect(left.bikes.map((bike) => bike.id)).toEqual(['bike-2']);
    expect(left.activeBikeId).toBe('bike-2');
  });

  it('should not delete the active bike, the only bike, an unknown bike or a candidate', () => {
    const passport = two();
    expect(removeGarageBike(passport, 'bike-2')).toBeNull();
    expect(removeGarageBike(make(), 'current')).toBeNull();
    expect(removeGarageBike(passport, 'nope')).toBeNull();
    const withCandidate = { ...make(), bikes: [...make().bikes, { id: 'c1', kind: 'candidate' as const }] };
    expect(removeGarageBike(withCandidate, 'c1')).toBeNull();
    expect(canRemoveGarageBike(passport, 'bike-2')).toBe(false);
  });

  it('should be able to delete a bike after switching away from it', () => {
    const switched = switchActiveBike(two(), 'current')!;
    expect(removeGarageBike(switched, 'bike-2')?.bikes.map((bike) => bike.id)).toEqual(['current']);
  });
});

describe('stored passports with a garage', () => {
  it('should read an older passport without the field: the first garage bike is active', () => {
    const old = JSON.parse(JSON.stringify(make({ currentSaddleHeightMm: 700 })));
    delete old.activeBikeId;
    expect(parsePassport(old)?.activeBikeId).toBe('current');
    expect(parsePassport({ ...old, bikes: [] })?.activeBikeId).toBe('current');
    expect(parsePassport({ ...old, bikes: [{ id: 'c1', kind: 'candidate' }, { id: 'mine', kind: 'current' }] })?.activeBikeId).toBe('mine');
  });

  it('should fall back when the stored active id is not a garage bike', () => {
    const base = JSON.parse(JSON.stringify(make()));
    expect(parsePassport({ ...base, activeBikeId: 'gone' })?.activeBikeId).toBe('current');
    expect(parsePassport({ ...base, activeBikeId: 42 })?.activeBikeId).toBe('current');
    expect(parsePassport({ ...base, bikes: [...base.bikes, { id: 'c1', kind: 'candidate' }], activeBikeId: 'c1' })?.activeBikeId).toBe('current');
  });

  it('should keep the active bike through a database row (the mark sits on the bike, no new column)', () => {
    const passport = addGarageBike(make(), 'Gravel', 'bike-2')!;
    const row = passportToRow('u1', passport);
    expect(row).not.toHaveProperty('active_bike_id');
    expect((row.bikes as Array<{ id: string; active?: boolean }>).map((bike) => [bike.id, bike.active])).toEqual([['current', undefined], ['bike-2', true]]);
    expect(rowToPassport(JSON.parse(JSON.stringify(row)))).toEqual(passport);
  });

  it('should read a row written before the garage existed', () => {
    const row = JSON.parse(JSON.stringify(passportToRow('u1', make({ currentSaddleHeightMm: 700 }))));
    expect(rowToPassport(row)?.activeBikeId).toBe('current');
  });

  it('should keep the diagnosis and drop one that is not well formed', () => {
    const diagnosis = { at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: null };
    const base = JSON.parse(JSON.stringify(make({ lastDiagnosis: diagnosis })));
    expect(parsePassport(base)?.bikes[0].diagnosis).toEqual(diagnosis);
    base.bikes[0].diagnosis = { at: 'yesterday', saddleDeltaMm: 1, spacerDeltaMm: 1 };
    expect(parsePassport(base)?.bikes[0].diagnosis).toBeUndefined();
    base.bikes[0].diagnosis = { at: '2026-10-23', saddleDeltaMm: 9999, spacerDeltaMm: 'x' };
    expect(parsePassport(base)?.bikes[0].diagnosis).toEqual({ at: '2026-10-23', saddleDeltaMm: null, spacerDeltaMm: null });
  });
});

describe('the kind of a garage bike (Epic 30)', () => {
  it('should give a new bike its own kind and make it the discipline of the passport', () => {
    const added = addGarageBike(make({ discipline: 'road' }), 'My MTB', 'b2', 'xc_mtb')!;
    expect(added.discipline).toBe('xc_mtb');
    expect(garageOf(added).map((bike) => [bike.id, bike.discipline])).toEqual([['current', 'road'], ['b2', 'xc_mtb']]);
    expect(passportToProfile(added).discipline).toBe('xc_mtb');
  });

  it('should take the discipline of the passport for a bike added without one', () => {
    expect(garageOf(addGarageBike(make({ discipline: 'gravel' }), 'Second', 'b2')!).find((bike) => bike.id === 'b2')?.discipline).toBe('gravel');
  });

  it('should follow the kind of the bike when another bike becomes active, and back', () => {
    const two = addGarageBike(make({ discipline: 'road' }), 'My MTB', 'b2', 'xc_mtb')!;
    const road = switchActiveBike(two, 'current')!;
    expect(road.discipline).toBe('road');
    expect(passportToProfile(road).discipline).toBe('road');
    expect(switchActiveBike(road, 'b2')!.discipline).toBe('xc_mtb');
  });

  it('should show the kind in the garage list, and judge the factory bike by it', () => {
    const two = addGarageBike(make({ discipline: 'road', stockBike: stock }), 'My MTB', 'b2', 'xc_mtb')!;
    const list = garageProfiles(two);
    expect(list.map((bike) => [bike.id, bike.discipline])).toEqual([['b2', 'xc_mtb'], ['current', 'road']]);
    expect(list.find((bike) => bike.id === 'current')?.isStock).toBe(true);
    expect(list.find((bike) => bike.id === 'b2')?.isStock).toBe(false);
  });

  it('should give a bike stored before the kinds existed the discipline of its passport, and keep its own kind when it has one', () => {
    const old = { ...make({ discipline: 'gravel' }), bikes: [{ id: 'current', kind: 'current' as const }, { id: 'x', kind: 'current' as const, discipline: 'xc_mtb' as const }] };
    const parsed = parsePassport(JSON.parse(JSON.stringify(old)))!;
    expect(garageOf(parsed).map((bike) => bike.discipline)).toEqual(['gravel', 'xc_mtb']);
    expect(parsePassport({ ...JSON.parse(JSON.stringify(old)), bikes: [{ id: 'current', kind: 'current', discipline: 'trekking' }] })?.bikes[0].discipline).toBe('gravel');
    expect(rowToPassport(passportToRow('u1', parsed))?.bikes.map((bike) => bike.discipline)).toEqual(['gravel', 'xc_mtb']);
  });
});
