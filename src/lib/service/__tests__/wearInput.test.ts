import { describe, it, expect } from 'vitest';
import { parseBook } from '../parseBook';
import { lastServiceDays, renewedBy, withRide } from '../wearInput';
import { DEFAULT_CARE } from '@/types/maintain';
import { BOOK_LIMITS, DEFAULT_BOOK, type BikeBook, type ServiceEntry } from '@/types/service';

const entry = (over: Partial<ServiceEntry>): ServiceEntry => ({ id: 'e', kind: 'chain', variant: null, at: '2026-06-01', value: null, price: null, currency: null, warrantyUntil: null, note: '', ...over });

describe('which parts an entry of the service log renews', () => {
  it.each([
    [{ kind: 'chain', value: 0.3 }, ['chainGauge']],
    [{ kind: 'chain', value: null }, ['chainLube', 'chainDeep']],
    [{ kind: 'brakes', variant: 'bleed' }, ['brakeBleed', 'brakeCheck']],
    [{ kind: 'brakes', variant: 'pads' }, ['brakeCheck']],
    [{ kind: 'suspension', variant: 'large' }, ['suspensionSmall', 'suspensionFull']],
    [{ kind: 'suspension', variant: 'small' }, ['suspensionSmall']],
    [{ kind: 'sealant' }, ['sealant']],
    [{ kind: 'mcheck' }, ['mcheck']],
    [{ kind: 'cable', variant: 'tape' }, []],
  ] as const)('should map %j', (over, expected) => {
    expect(renewedBy(entry(over as Partial<ServiceEntry>))).toEqual(expected);
  });
});

describe('the last service of each part', () => {
  it('should take the latest of the log, the logbook mark and the last M-Check', () => {
    const book = { ...DEFAULT_BOOK, log: [entry({ at: '2026-05-01' }), entry({ id: 'b', at: '2026-07-01' })], wearDone: { chainLube: '2026-08-01', bearings: '2026-09-01' } };
    const days = lastServiceDays(book, { ...DEFAULT_CARE, inspectedAt: '2026-10-01' });
    expect(days).toMatchObject({ chainLube: '2026-08-01', chainDeep: '2026-07-01', bearings: '2026-09-01', mcheck: '2026-10-01' });
    expect(days.brakeBleed).toBeUndefined();
  });
});

describe('the rides of the book', () => {
  const stored = { rides: [{ id: 'a', date: '2026-10-01', terrain: 'gravel', km: 40, elevationM: 500, rain: true }, { id: 'b', date: 'x', terrain: 'road', km: 5, elevationM: 0 }, { id: 'c', date: '2026-10-02', terrain: 'boat', km: 5, elevationM: 0 }, { id: 'd', date: '2026-10-02', terrain: 'road', km: 5000, elevationM: 0 }, { id: 'e', date: '2026-10-02', terrain: 'road', km: 5, elevationM: -4 }], wearDone: { chainLube: '2026-10-01', bearings: 'soon', hacked: '2026-10-01' } };

  it('should drop every ride that is not valid and keep the rest', () => {
    const book = parseBook(stored);
    expect(book.rides).toEqual([{ id: 'a', date: '2026-10-01', terrain: 'gravel', km: 40, elevationM: 500, rain: true }]);
    expect(book.wearDone).toEqual({ chainLube: '2026-10-01' });
  });

  it('should keep newest first and cut at the limit', () => {
    const ride = (id: string, date: string) => ({ id, date, terrain: 'road' as const, km: 10, elevationM: 0, rain: false });
    let book: BikeBook = { ...DEFAULT_BOOK, rides: [ride('a', '2026-10-01')] };
    book = withRide(book, ride('b', '2026-10-05'), BOOK_LIMITS.rides);
    expect(book.rides.map((r) => r.id)).toEqual(['b', 'a']);
    expect(withRide(book, ride('c', '2026-09-01'), 2).rides.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('should open a book stored before the logbook existed', () => {
    expect(parseBook({ identity: {}, log: [] })).toMatchObject({ rides: [], wearDone: {} });
  });
});
