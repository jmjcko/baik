import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CARE } from '@/types/maintain';
import { BOOK_LIMITS, DEFAULT_BOOK, type ServiceEntry } from '@/types/service';
import { BOOK_STORAGE_KEY, loadBook, saveBook } from '../bookStore';
import { isEmptyBook, parseBook, photoOf } from '../parseBook';
import { addEntry, carePatch, draftProblem, emptyDraft, entryOf, readNumber, totalsByCurrency } from '../quickLog';
import { encodeWithin, scaledSize } from '../photo';
import { knownFromBike } from '../fitSummary';

const entry = (over: Partial<ServiceEntry>): ServiceEntry => ({ id: 'e', kind: 'chain', variant: null, at: '2026-09-01', value: null, price: null, currency: null, warrantyUntil: null, note: '', ...over });
const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

describe('the parsing of a stored book', () => {
  it('should fall back to an empty book for anything that is not an object', () => {
    for (const raw of [null, undefined, 'x', 5, [], true]) expect(parseBook(raw)).toEqual(DEFAULT_BOOK);
  });

  it('should keep a good book and clean its text', () => {
    const book = parseBook({ identity: { make: '  Canyon <script> ', model: 'Endurace', year: 2024, serial: 'WCAN\u0000123', insurance: 'P-1', photo: PHOTO }, log: [entry({ note: 'ok\n<b>x</b>' })], reminders: { leadDays: 14, chainDays: 90, sealantMonths: 5 } });
    expect(book.identity).toMatchObject({ make: 'Canyon script', model: 'Endurace', year: 2024, serial: 'WCAN 123', photo: PHOTO });
    expect(book.log[0].note).toBe('ok b x /b');
    expect(book.reminders).toMatchObject({ leadDays: 14, chainDays: 90, sealantMonths: 5, brakeMonths: 12 });
  });

  it('should drop bad entries and bad values instead of failing', () => {
    const book = parseBook({
      identity: { year: 1800, photo: 'http://evil.test/x.png' },
      log: [null, 5, entry({ id: '' }), entry({ at: 'tomorrow' }), { ...entry({}), kind: 'wash' }, { ...entry({ id: 'ok', value: -3, price: 12, warrantyUntil: 'x' }), variant: 'nope', currency: 'gbp' }],
      reminders: { leadDays: 99, chainDays: 'x', sealantMonths: 1 },
    });
    expect(book.identity).toMatchObject({ year: null, photo: null });
    expect(book.log).toEqual([entry({ id: 'ok', variant: null, value: null, price: 12, currency: null, warrantyUntil: null })]);
    expect(book.reminders).toEqual(DEFAULT_BOOK.reminders);
  });

  it('should cap the number of entries and accept only small images', () => {
    const many = Array.from({ length: BOOK_LIMITS.entries + 20 }, (_, index) => entry({ id: `e${index}` }));
    expect(parseBook({ log: many }).log).toHaveLength(BOOK_LIMITS.entries);
    expect(photoOf(PHOTO)).toBe(PHOTO);
    expect(photoOf(`data:image/jpeg;base64,${'A'.repeat(BOOK_LIMITS.photoChars)}`)).toBeNull();
    expect(photoOf('data:text/html;base64,AAAA')).toBeNull();
    expect(photoOf('javascript:alert(1)')).toBeNull();
  });
});

describe('the local store of books', () => {
  beforeEach(() => localStorage.clear());

  it('should keep a book per bike in this browser and give an empty one for a bike without a book', () => {
    const book = { ...DEFAULT_BOOK, log: [entry({})] };
    expect(saveBook('a', book)).toBe(true);
    expect(loadBook('a').log).toHaveLength(1);
    expect(loadBook('b')).toEqual(DEFAULT_BOOK);
    expect(localStorage.getItem(BOOK_STORAGE_KEY)).toContain('"version":1');
  });

  it('should remove an emptied book and survive a broken store and unusual ids', () => {
    saveBook('a', { ...DEFAULT_BOOK, log: [entry({})] });
    saveBook('a', DEFAULT_BOOK);
    expect(JSON.parse(localStorage.getItem(BOOK_STORAGE_KEY) ?? '{}').bikes).toEqual({});
    localStorage.setItem(BOOK_STORAGE_KEY, '{not json');
    expect(loadBook('a')).toEqual(DEFAULT_BOOK);
    expect(loadBook('__proto__')).toEqual(DEFAULT_BOOK);
    expect(isEmptyBook(DEFAULT_BOOK)).toBe(true);
  });
});

describe('the quick entries', () => {
  it('should read numbers with a decimal comma and refuse the rest', () => {
    expect(readNumber('0,4')).toBe(0.4);
    expect(readNumber('')).toBeNull();
    expect(readNumber('-1')).toBeNaN();
    expect(readNumber('1e3')).toBeNaN();
  });

  it('should find the first problem of a draft', () => {
    const base = emptyDraft('chain', '2026-10-30', 'eur');
    expect(draftProblem(base, '2026-10-30')).toBeNull();
    expect(draftProblem({ ...base, at: '2026-11-01' }, '2026-10-30')).toBe('day');
    expect(draftProblem({ ...base, value: '4' }, '2026-10-30')).toBe('value');
    expect(draftProblem({ ...base, price: 'abc' }, '2026-10-30')).toBe('price');
    expect(draftProblem({ ...base, warrantyUntil: '1.1.2027' }, '2026-10-30')).toBe('warranty');
    expect(draftProblem({ ...emptyDraft('brakes', '2026-10-30', 'czk'), value: '5' }, '2026-10-30')).toBe('value');
    expect(emptyDraft('brakes', '2026-10-30', 'czk').variant).toBe('pads');
  });

  it('should make an entry that keeps a value only for the chain and the sealant', () => {
    expect(entryOf({ ...emptyDraft('chain', '2026-10-30', 'eur'), value: '0,4', price: '25,5', note: ' <b>ok</b> ' }, 'x')).toMatchObject({ id: 'x', value: 0.4, price: 25.5, currency: 'eur', note: 'b ok /b' });
    expect(entryOf({ ...emptyDraft('brakes', '2026-10-30', 'eur'), value: '3' }, 'y')).toMatchObject({ value: null, price: null, currency: null });
  });

  it('should keep the log newest first', () => {
    const log = addEntry(addEntry([], entry({ id: 'a', at: '2026-09-01' })), entry({ id: 'b', at: '2026-10-01' }));
    expect(addEntry(log, entry({ id: 'c', at: '2026-09-15' })).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('should update the care of the bike only from the newest entry of a kind', () => {
    const old = [entry({ at: '2026-10-01', value: 0.3 })];
    expect(carePatch(DEFAULT_CARE, [], entry({ value: 0.4 }))).toEqual({ chainWearPct: 0.4 });
    expect(carePatch(DEFAULT_CARE, old, entry({ at: '2026-09-01', value: 0.2 }))).toEqual({});
    expect(carePatch(DEFAULT_CARE, [], entry({ value: null }))).toEqual({});
    expect(carePatch(DEFAULT_CARE, [], entry({ kind: 'sealant', at: '2026-10-20', value: 40 }))).toEqual({ sealantAt: '2026-10-20', tubeless: true });
    expect(carePatch(DEFAULT_CARE, [], entry({ kind: 'cable', variant: 'tape', at: '2026-10-20' }))).toEqual({ barTapeAt: '2026-10-20' });
    expect(carePatch(DEFAULT_CARE, [], entry({ kind: 'cable', variant: 'cable' }))).toEqual({});
    expect(carePatch(DEFAULT_CARE, [], entry({ kind: 'brakes', variant: 'pads' }))).toEqual({});
  });

  it('should add the prices per currency', () => {
    const log = [entry({ price: 10.1, currency: 'eur' }), entry({ price: 20.2, currency: 'eur' }), entry({ price: 500, currency: 'czk' }), entry({ price: null })];
    expect(totalsByCurrency(log)).toEqual([{ currency: 'eur', total: 30.3 }, { currency: 'czk', total: 500 }]);
  });
});

describe('the photo', () => {
  it('should scale down to the longer edge and never up', () => {
    expect(scaledSize(4000, 3000, 1000)).toEqual({ width: 1000, height: 750 });
    expect(scaledSize(300, 200, 1000)).toEqual({ width: 300, height: 200 });
  });

  it('should try smaller and poorer encodings until one fits, and give up when none does', () => {
    const calls: Array<[number, number]> = [];
    const encode = (edge: number, quality: number) => { calls.push([edge, quality]); return 'x'.repeat(edge === 800 && quality === 0.7 ? 100 : 1000); };
    expect(encodeWithin(encode, 500)).toHaveLength(100);
    expect(calls[0]).toEqual([1280, 0.85]);
    expect(encodeWithin(() => 'x'.repeat(1000), 10)).toBeNull();
    expect(encodeWithin(() => null, 10)).toBeNull();
  });
});

describe('what the garage knows about a bike', () => {
  const bike = { name: null, brand: 'Cube', model: 'Attain', year: 2027 };

  it('should give the factory brand, model and year, and nothing without them', () => {
    expect(knownFromBike(bike)).toEqual({ make: 'Cube', model: 'Attain', year: 2027 });
    expect(knownFromBike({ name: null, brand: null, model: null, year: null })).toBeUndefined();
    expect(knownFromBike(undefined)).toBeUndefined();
  });

  it('should let the name of the rider win when it points at another brand than the factory setup', () => {
    expect(knownFromBike({ ...bike, name: 'Cube Attain 2027' })).toBeDefined();
    expect(knownFromBike({ name: 'Cube Attain 2027', brand: 'Superior', model: 'X-Road', year: 2025 })).toBeUndefined();
    expect(knownFromBike({ ...bike, name: 'My CUBE' })).toBeDefined();
  });
});
