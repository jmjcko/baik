import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { decideConsent, resetConsents } from '@/lib/consent/useConsent';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { BOOK_STORAGE_KEY, clearIntervalsEverywhere, intervalsOverlapElsewhere, loadBook } from '@/lib/service/bookStore';
import { INTERVALS_KEYS_STORAGE, INTERVALS_KEY_STORAGE, forgetCreds, loadCreds, saveCreds } from '@/lib/intervals/keyStore';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { IntervalsConnectCard } from '../IntervalsConnectCard';

const TODAY = '2026-11-05';
const activity = (over: Record<string, unknown> = {}) => ({ id: 'i101', type: 'GravelRide', distance: 62_400, total_elevation_gain: 780, start_date_local: '2026-10-25T07:15:00', gear: { id: 'b1', name: 'Grizl' }, ...over });
const stubFetch = (data: unknown, status = 200) => {
  const mock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => (status === 200 ? Response.json(data) : new Response('', { status })));
  vi.stubGlobal('fetch', mock);
  return mock;
};

function Host({ locale, onBook, initial = DEFAULT_BOOK }: { locale: Locale; onBook: (book: BikeBook) => void; initial?: BikeBook }) {
  const [book, setBook] = React.useState<BikeBook>(initial);
  const update = (change: (b: BikeBook) => BikeBook) => setBook((previous) => { const next = change(previous); onBook(next); return next; });
  return <IntervalsConnectCard t={translations[locale]} bikeId="current" book={book} update={update} today={TODAY} />;
}

const open = (locale: Locale, initial?: BikeBook) => {
  const books: BikeBook[] = [];
  render(<Host locale={locale} onBook={(b) => books.push(b)} initial={initial} />);
  return books;
};

describe('the rules in the browser storage', () => {
  beforeEach(() => { localStorage.clear(); decideConsent('intervals', true); });
  const store = (bikes: Record<string, unknown>) => localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes }));
  const ruled = (types: string[], gearId: string | null = null) => ({ ...DEFAULT_BOOK, intervals: { gearId, gearName: gearId, types, since: '2026-09-01', syncedAt: null }, rides: [{ id: 'icu-1', date: '2026-10-20', terrain: 'road', km: 5, elevationM: 0, rain: false }, { id: 'r1', date: '2026-10-21', terrain: 'road', km: 5, elevationM: 0, rain: false }] });
  it('should find a rule of another bike that overlaps and clear every Intervals.icu ride', () => {
    store({ a: ruled(['road']) });
    expect(intervalsOverlapElsewhere({ gearId: null, types: ['road', 'gravel'] }, 'b')).toBe(true);
    expect(intervalsOverlapElsewhere({ gearId: null, types: ['road'] }, 'a')).toBe(false);
    expect(intervalsOverlapElsewhere({ gearId: null, types: ['gravel'] }, 'b')).toBe(false);
    expect(clearIntervalsEverywhere()).toBe(true);
    expect(loadBook('a')).toMatchObject({ intervals: null, rides: [{ id: 'r1' }] });
  });
});

describe.each(['en', 'cs'] as Locale[])('the Intervals.icu card (%s)', (locale) => {
  const s = translations[locale].service.logbook.intervals;
  const rt = translations[locale].service.logbook.rides.terrains;
  const connect = async (key = 'abcdefgh12345') => {
    fireEvent.change(screen.getByLabelText(s.form.key), { target: { value: key } });
    fireEvent.click(screen.getByRole('button', { name: s.form.load }));
  };
  beforeEach(() => { localStorage.clear(); decideConsent('intervals', true); });
  afterEach(() => vi.unstubAllGlobals());

  it('should ask for the consent first and show the key form only after the rider agrees', () => {
    resetConsents();
    open(locale);
    const panel = screen.getByTestId('consent-prompt-intervals');
    expect(within(panel).getByText(translations[locale].consent.purposes.intervals.title)).toBeInTheDocument();
    expect(screen.queryByLabelText(s.form.key)).not.toBeInTheDocument();
    fireEvent.click(within(panel).getByRole('button', { name: translations[locale].consent.prompt.decline }));
    expect(within(screen.getByTestId('consent-prompt-intervals')).getByRole('status')).toHaveTextContent(translations[locale].consent.prompt.needed);
    fireEvent.click(screen.getByRole('button', { name: translations[locale].consent.prompt.allow }));
    expect(screen.getByLabelText(s.form.key)).toBeInTheDocument();
  });

  it('should ask for the key as a password field and explain where it goes', () => {
    open(locale);
    expect(screen.getByLabelText(s.form.key)).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('intervals-card')).toHaveTextContent(s.intro);
    expect(loadCreds()).toBeNull();
  });

  it('should save the key in this browser only after Intervals.icu accepted it, and offer the bikes found on the rides', async () => {
    const mock = stubFetch([activity(), activity({ id: 'i2', gear: { id: 'b2', name: 'Aethos' } })]);
    open(locale);
    await connect();
    const select = await screen.findByLabelText(s.pair.gear);
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([s.pair.anyGear, 'Grizl', 'Aethos']);
    expect(loadCreds()).toEqual({ athleteId: '0', key: 'abcdefgh12345' });
    expect(String(mock.mock.calls[0][0])).toContain('https://intervals.icu/api/v1/athlete/0/activities');
    expect(String((mock.mock.calls[0][1]?.headers as Record<string, string>).Authorization)).toBe(`Basic ${btoa('API_KEY:abcdefgh12345')}`);
  });

  it('should not save a key that Intervals.icu refused', async () => {
    stubFetch([], 401);
    open(locale);
    await connect();
    expect(await screen.findByRole('alert')).toHaveTextContent(s.errors.unauthorized);
    expect(localStorage.getItem(INTERVALS_KEY_STORAGE)).toBeNull();
  });

  it('should pair the bike of Intervals.icu with the types and load only the rides that belong to this bike', async () => {
    stubFetch([activity(), activity({ id: 'i2', type: 'Ride', gear: { id: 'b2', name: 'Aethos' } }), activity({ id: 'i3', type: 'Ride', gear: { id: 'b1', name: 'Grizl' }, distance: 30_000, total_elevation_gain: 100 })]);
    const books = open(locale);
    await connect();
    fireEvent.change(await screen.findByLabelText(s.pair.gear), { target: { value: 'b1' } });
    fireEvent.click(screen.getByLabelText(rt.trainer));
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    expect(await screen.findByText(fill(s.notices.synced, { n: 3 }))).toBeInTheDocument();
    const last = books[books.length - 1];
    expect(last.intervals).toMatchObject({ gearId: 'b1', gearName: 'Grizl', types: ['road', 'gravel', 'mtb'], syncedAt: TODAY });
    expect(last.rides.map((r) => r.id).sort()).toEqual(['icu-i101', 'icu-i3']);
    expect(screen.getByTestId('intervals-paired')).toHaveTextContent('Grizl');
  });

  it('should count by the type when the data has no bike, and say so', async () => {
    stubFetch([activity({ gear: undefined }), activity({ id: 'i2', type: 'Ride', gear: undefined })]);
    const books = open(locale);
    await connect();
    expect(await screen.findByText(s.pair.noGear)).toBeInTheDocument();
    for (const type of ['gravel', 'mtb', 'trainer'] as const) fireEvent.click(screen.getByLabelText(rt[type]));
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    await screen.findByTestId('intervals-paired');
    expect(screen.getByTestId('intervals-no-gear')).toHaveTextContent(s.noGearNote);
    expect(books[books.length - 1].rides.map((r) => r.id)).toEqual(['icu-i2']);
  });

  it('should refuse a rule that another bike already uses, and a rule without types or bike', async () => {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { other: { ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types: ['road', 'gravel', 'mtb', 'trainer'], since: '2026-09-01', syncedAt: null } } } }));
    stubFetch([activity({ gear: undefined })]);
    const books = open(locale);
    await connect();
    await screen.findByText(s.pair.noGear);
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    expect(await screen.findByText(s.notices.overlap)).toBeInTheDocument();
    for (const type of ['road', 'gravel', 'mtb', 'trainer'] as const) fireEvent.click(screen.getByLabelText(rt[type]));
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    expect(await screen.findByText(s.notices.noTypes)).toBeInTheDocument();
    expect(books.some((book) => book.intervals)).toBe(false);
  });

  it('should remember the key: after a reload the key form is gone and the rule form is shown', () => {
    saveCreds({ athleteId: '0', key: 'abcdefgh12345' });
    open(locale);
    expect(screen.queryByTestId('intervals-key-form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: s.pair.loadGears })).toBeInTheDocument();
  });

  it('should forget the key and the loaded rides at once', async () => {
    localStorage.setItem(INTERVALS_KEY_STORAGE, JSON.stringify({ athleteId: '0', key: 'abcdefgh12345' }));
    const paired = { ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types: ['gravel' as const], since: '2026-09-01', syncedAt: TODAY }, rides: [{ id: 'icu-i101', date: '2026-10-25', terrain: 'gravel' as const, km: 62.4, elevationM: 780, rain: false }, { id: 'r1', date: '2026-10-01', terrain: 'road' as const, km: 10, elevationM: 0, rain: false }] };
    const books = open(locale, paired);
    fireEvent.click(screen.getByRole('button', { name: s.forget }));
    expect(localStorage.getItem(INTERVALS_KEY_STORAGE)).toBeNull();
    expect(books[books.length - 1]).toMatchObject({ intervals: null, rides: [{ id: 'r1' }] });
    expect(await screen.findByTestId('intervals-key-form')).toBeInTheDocument();
  });

  it('should show no emoji', () => {
    open(locale);
    expect(screen.getByTestId('intervals-card').textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe('one Intervals.icu key for each rider', () => {
  beforeEach(() => { localStorage.clear(); decideConsent('intervals', true); });
  const mine = { athleteId: '0', key: 'mykey-1234567' };
  const hers = { athleteId: 'i4242', key: 'herkey-1234567' };

  it('should keep the key of every rider apart and forget only one of them', () => {
    saveCreds(mine, 'me');
    saveCreds(hers, 'wife');
    expect(loadCreds('me')).toEqual(mine);
    expect(loadCreds('wife')).toEqual(hers);
    expect(loadCreds('child')).toBeNull();
    forgetCreds('me');
    expect(loadCreds('me')).toBeNull();
    expect(loadCreds('wife')).toEqual(hers);
    expect(JSON.parse(localStorage.getItem(INTERVALS_KEYS_STORAGE) ?? '{}')).toEqual({ wife: hers });
  });

  it('should give the key of the first version to the rider of a bike that was paired with it, and to nobody else', () => {
    localStorage.setItem(INTERVALS_KEY_STORAGE, JSON.stringify(mine));
    expect(loadCreds('wife')).toBeNull();
    expect(loadCreds('wife', false)).toBeNull();
    expect(localStorage.getItem(INTERVALS_KEY_STORAGE)).not.toBeNull();
    expect(loadCreds('me', true)).toEqual(mine);
    expect(localStorage.getItem(INTERVALS_KEY_STORAGE)).toBeNull();
    expect(loadCreds('wife', true)).toBeNull();
    expect(loadCreds('me')).toEqual(mine);
  });

  it('should count an overlap and clear the rides only among the bikes of one rider', () => {
    const ruled = (types: Array<'road' | 'gravel' | 'mtb' | 'trainer'>) => ({ ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types, since: '2026-09-01', syncedAt: null }, rides: [{ id: 'icu-1', date: '2026-10-25', terrain: 'road' as const, km: 40, elevationM: 300, rain: false }] });
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { mine: ruled(['road']), hers: ruled(['road']) } }));
    expect(intervalsOverlapElsewhere({ gearId: null, types: ['road'] }, 'hers')).toBe(true);
    expect(intervalsOverlapElsewhere({ gearId: null, types: ['road'] }, 'hers', ['hers'])).toBe(false);
    expect(clearIntervalsEverywhere(['mine'])).toBe(true);
    expect(loadBook('mine')).toMatchObject({ intervals: null, rides: [] });
    expect(loadBook('hers').intervals).not.toBeNull();
    expect(loadBook('hers').rides).toHaveLength(1);
  });
});

describe.each(['en', 'cs'] as Locale[])('the Intervals.icu card of a rider (%s)', (locale) => {
  const t = translations[locale];
  const s = t.service.logbook.intervals;
  beforeEach(() => { localStorage.clear(); decideConsent('intervals', true); });
  const show = (riderId: string, bikeId: string, extra: Partial<React.ComponentProps<typeof IntervalsConnectCard>> = {}) => render(<IntervalsConnectCard t={t} bikeId={bikeId} book={DEFAULT_BOOK} update={vi.fn()} today={TODAY} riderId={riderId} {...extra} />);

  it('should show the key form to a rider who has no key, even when another rider has one, and say whose connection it is', () => {
    saveCreds({ athleteId: '0', key: 'mykey-1234567' }, 'me');
    show('wife', 'bike-w', { riderName: 'Veronika' });
    expect(screen.getByTestId('intervals-key-form')).toBeInTheDocument();
    expect(screen.getByTestId('intervals-rider')).toHaveTextContent(fill(s.riderNote, { rider: 'Veronika' }));
    expect(screen.getByTestId('intervals-state')).toHaveTextContent(t.connections.states.disconnected);
  });

  it('should use the key of its own rider', () => {
    saveCreds({ athleteId: '0', key: 'mykey-1234567' }, 'me');
    show('me', 'bike-m');
    expect(screen.queryByTestId('intervals-key-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('intervals-rider')).not.toBeInTheDocument();
  });

  it('should forget only the key and the rides of its own rider', () => {
    saveCreds({ athleteId: '0', key: 'mykey-1234567' }, 'me');
    saveCreds({ athleteId: 'i4242', key: 'herkey-1234567' }, 'wife');
    const ruled = { ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types: ['road' as const], since: '2026-09-01', syncedAt: TODAY }, rides: [{ id: 'icu-1', date: '2026-10-25', terrain: 'road' as const, km: 40, elevationM: 300, rain: false }] };
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { 'bike-m': ruled, 'bike-w': ruled } }));
    render(<IntervalsConnectCard t={t} bikeId="bike-w" book={ruled} update={vi.fn()} today={TODAY} riderId="wife" riderBikeIds={['bike-w']} />);
    fireEvent.click(screen.getByRole('button', { name: s.forget }));
    expect(loadCreds('wife')).toBeNull();
    expect(loadCreds('me')).not.toBeNull();
    expect(loadBook('bike-w').intervals).toBeNull();
    expect(loadBook('bike-m').intervals).not.toBeNull();
    expect(loadBook('bike-m').rides).toHaveLength(1);
  });
});
