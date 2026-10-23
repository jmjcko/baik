import { describe, it, expect } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import type { ExtractedBike } from '@/lib/bikes/extraction';
import { fieldsOf, invalidFields, selectionOf } from '../stock/reviewForm';

const bike: ExtractedBike = { brand: 'Cube', model: 'Attain', year: 2024, size: '54', spec: { ...STOCK_BIKE_SPECS[0].sizes.M, stockStemMm: null } };

describe('review form', () => {
  it('should show every number as text and leave an unstated part empty', () => {
    expect(fieldsOf(bike)).toEqual({ brand: 'Cube', model: 'Attain', year: '2024', stack: '590', reach: '378', seatAngle: '73.5', stem: '', handlebar: '410', crank: '172.5' });
    expect(fieldsOf({ ...bike, year: null, brand: '' }).year).toBe('');
  });

  it('should accept the fields as they come from the AI', () => {
    expect(invalidFields(fieldsOf(bike))).toEqual([]);
  });

  it('should name the fields that are empty or out of range: brand, model, year, stack, reach, seat angle', () => {
    const fields = { ...fieldsOf(bike), brand: ' ', model: 'm'.repeat(61), year: '1850', stack: '59', reach: '', seatAngle: '7.35' };
    expect(invalidFields(fields).sort()).toEqual(['brand', 'model', 'reach', 'seatAngle', 'stack', 'year'].sort());
    expect(invalidFields({ ...fieldsOf(bike), year: '2024.5' })).toEqual(['year']);
    expect(invalidFields({ ...fieldsOf(bike), year: 'abc' })).toEqual(['year']);
  });

  it('should require a stock part only when it is typed, and then in its range', () => {
    expect(invalidFields({ ...fieldsOf(bike), stem: '', handlebar: '', crank: '' })).toEqual([]);
    expect(invalidFields({ ...fieldsOf(bike), stem: '1000', handlebar: '41', crank: 'long' }).sort()).toEqual(['crank', 'handlebar', 'stem']);
    expect(invalidFields({ ...fieldsOf(bike), stem: '100', handlebar: '420', crank: '172,5' })).toEqual([]);
  });

  it('should build the confirmed bike from what the rider typed: a filled part, a decimal comma, an empty part as null', () => {
    const fields = { ...fieldsOf(bike), brand: ' Cube ', stem: '90', crank: '172,5', handlebar: '', stack: '588' };
    expect(selectionOf(fields, '54', bike)).toEqual({
      source: 'ai', brand: 'Cube', model: 'Attain', year: 2024, size: '54',
      spec: { ...bike.spec, frameStackMm: 588, stockStemMm: 90, stockHandlebarMm: null, stockCrankMm: 172.5 },
    });
  });
});
