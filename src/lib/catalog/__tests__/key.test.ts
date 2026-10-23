import { describe, it, expect } from 'vitest';
import { bikeKey, modelKey } from '../key';

describe('bike keys (the same rule as public.bike_key)', () => {
  it('should reduce brand, model, year and size to lowercase letters and digits', () => {
    expect(bikeKey('Cube', 'Attain GTC SLX', 2024, '54')).toBe('cube|attaingtcslx|2024|54');
    expect(bikeKey(' CUBE ', 'attain-gtc  slx!', 2024, ' 54 cm')).toBe('cube|attaingtcslx|2024|54cm');
  });

  it('should drop characters that are not ASCII letters or digits, as the database does', () => {
    expect(bikeKey('Škoda', 'Ráz', 2024, 'M')).toBe('koda|rz|2024|m');
  });

  it('should tell sizes and years apart, and the model key leaves the size out', () => {
    expect(bikeKey('Cube', 'Attain', 2024, 'M')).not.toBe(bikeKey('Cube', 'Attain', 2024, 'L'));
    expect(bikeKey('Cube', 'Attain', 2023, 'M')).not.toBe(bikeKey('Cube', 'Attain', 2024, 'M'));
    expect(modelKey('Cube', 'Attain', 2024)).toBe('cube|attain|2024');
  });
});
