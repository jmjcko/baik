import { describe, it, expect } from 'vitest';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { StockSelection } from '@/lib/bikes/types';
import { passportToProfile, passportToRow, profileToPassport, rowToPassport } from '../mappers';
import { parsePassport } from '../parse';
import { isEmptyPassport, samePassportData } from '../merge';

const seed: StockSelection = { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };
const ai: StockSelection = { source: 'ai', brand: 'Canyon', model: 'Endurace CF 8', year: 2024, size: 'M', spec: STOCK_BIKE_SPECS[0].sizes.M };
const passportOf = (overrides: Partial<ProfileValues> = {}) => {
  const values = { ...DEFAULT_PROFILE, ...overrides };
  return profileToPassport(values, deriveCoordinates(values));
};

describe('the stock bike in the passport', () => {
  it.each([['a seed bike', seed], ['an AI bike', ai]])('should keep %s through the passport, the parser and the database row', (_name, stockBike) => {
    const passport = passportOf({ stockBike });
    expect(passport.bikes[0].stock).toEqual(stockBike);
    expect(parsePassport(JSON.parse(JSON.stringify(passport)))?.bikes[0].stock).toEqual(stockBike);
    expect(passportToProfile(rowToPassport(passportToRow('u1', passport))!).stockBike).toEqual(stockBike);
  });

  it('should store nothing when the bike has no factory setup, and read an older passport without it as none', () => {
    const passport = passportOf();
    expect(passport.bikes[0]).not.toHaveProperty('stock');
    expect(passportToProfile(passport).stockBike).toBeNull();
  });

  it('should drop a malformed stock bike and keep the rest of the passport', () => {
    const passport = passportOf({ stockBike: seed });
    const broken = JSON.parse(JSON.stringify(passport));
    broken.bikes[0].stock = { source: 'ai', brand: 'x', model: 'y', year: 2024, size: 'M', spec: { frameStackMm: 1 } };
    const parsed = parsePassport(broken);
    expect(parsed?.bikes[0]).not.toHaveProperty('stock');
    expect(parsed?.anatomy.inseamMm).toBe(DEFAULT_PROFILE.inseamMm);
  });

  it('should count a stock bike as data of the rider: not an empty passport, not the same as one without', () => {
    expect(isEmptyPassport(passportOf())).toBe(true);
    expect(isEmptyPassport(passportOf({ stockBike: seed }))).toBe(false);
    expect(samePassportData(passportOf({ stockBike: seed }), passportOf())).toBe(false);
    expect(samePassportData(passportOf({ stockBike: seed }), passportOf({ stockBike: { ...seed } }))).toBe(true);
  });

  it('should stay far below the size limit of the bikes column', () => {
    expect(JSON.stringify(passportOf({ stockBike: ai }).bikes).length).toBeLessThan(2000);
  });
});
