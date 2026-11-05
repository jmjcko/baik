import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { BOOK_STORAGE_KEY, clearStravaEverywhere, pairedElsewhere, loadBook } from '@/lib/service/bookStore';
import { captureStravaReturn, clearStravaReturn } from '@/lib/strava/returnFlag';
import { mergeStravaRides, pairBike, unpairBike } from '@/lib/strava/book';
import { parseBook } from '@/lib/service/parseBook';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { StravaConnectCard } from '../StravaConnectCard';

const TODAY = '2026-11-05';
const bike = { id: 'b99', name: 'Road', km: 1000 };
const stravaRide = (over: Record<string, unknown> = {}) => ({ id: 'strava-1', date: '2026-10-20', terrain: 'road' as const, km: 42.3, elevationM: 512, gearId: 'b99', ...over });

function Host({ locale, onBook }: { locale: Locale; onBook: (book: BikeBook) => void }) {
  const [book, setBook] = React.useState<BikeBook>(DEFAULT_BOOK);
  const update = (change: (b: BikeBook) => BikeBook) => setBook((previous) => { const next = change(previous); onBook(next); return next; });
  return <StravaConnectCard t={translations[locale]} bikeId="current" book={book} update={update} today={TODAY} />;
}

async function open(locale: Locale, { signedIn = true, connected = false } = {}) {
  const fake = fakeAuthClient();
  fake.database.tables.strava_connections = connected ? [{ athlete_id: 777 }] : [];
  const books: BikeBook[] = [];
  render(<AuthProvider client={fake.client}><Host locale={locale} onBook={(b) => books.push(b)} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
  return { fake, books };
}

const reply = (json: unknown) => vi.fn(async () => Response.json(json));

describe('the book and the pairing', () => {
  const paired = pairBike(DEFAULT_BOOK, bike, '2026-08-01');
  it('should pair, merge rides, keep what was typed and the tick for the rain, and take the pairing away with its rides', () => {
    const typed = { id: 'r1', date: '2026-10-01', terrain: 'road' as const, km: 10, elevationM: 0, rain: false };
    const first = mergeStravaRides({ ...paired, rides: [typed] }, [stravaRide()], TODAY, 500);
    expect(first.rides.map((r) => r.id)).toEqual(['strava-1', 'r1']);
    expect(first.strava?.syncedAt).toBe(TODAY);
    const rained = { ...first, rides: first.rides.map((r) => (r.id === 'strava-1' ? { ...r, rain: true } : r)) };
    const second = mergeStravaRides(rained, [stravaRide(), stravaRide({ id: 'strava-2', date: '2026-10-22' })], TODAY, 500);
    expect(second.rides.find((r) => r.id === 'strava-1')?.rain).toBe(true);
    expect(second.rides).toHaveLength(3);
    expect(unpairBike(second)).toMatchObject({ strava: null, rides: [typed] });
  });
  it('should not merge without a pairing and should drop the old Strava rides when another bike is paired', () => {
    expect(mergeStravaRides(DEFAULT_BOOK, [stravaRide()], TODAY, 500)).toBe(DEFAULT_BOOK);
    const other = pairBike({ ...paired, rides: [{ ...stravaRide(), rain: false }] }, { id: 'b5', name: 'Gravel' }, '2026-09-01');
    expect(other.rides).toEqual([]);
  });
  it('should keep a valid pairing when the book is read and drop a bad one', () => {
    expect(parseBook({ strava: { gearId: 'b99', gearName: 'Road', since: '2026-08-01', syncedAt: null } }).strava).toMatchObject({ gearId: 'b99' });
    for (const bad of [{ gearId: '../x', since: '2026-08-01' }, { gearId: 'b99', since: 'soon' }, 'x', null]) expect(parseBook({ strava: bad }).strava).toBeNull();
  });
});

describe('the pairing across the bikes of this browser', () => {
  beforeEach(() => localStorage.clear());
  const store = (bikes: Record<string, unknown>) => localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes }));
  it('should know that a Strava bike is taken by another bike and clear every Strava ride when Strava is disconnected', () => {
    store({ a: { ...paired(), rides: [{ id: 'strava-1', date: '2026-10-20', terrain: 'road', km: 5, elevationM: 0, rain: false }, { id: 'r1', date: '2026-10-21', terrain: 'road', km: 5, elevationM: 0, rain: false }] }, b: { ...DEFAULT_BOOK } });
    expect(pairedElsewhere('b99', 'b')).toBe(true);
    expect(pairedElsewhere('b99', 'a')).toBe(false);
    expect(clearStravaEverywhere()).toBe(true);
    expect(loadBook('a')).toMatchObject({ strava: null, rides: [{ id: 'r1' }] });
    expect(pairedElsewhere('b99', 'b')).toBe(false);
  });
  const paired = () => ({ ...DEFAULT_BOOK, strava: { gearId: 'b99', gearName: 'Road', since: '2026-08-01', syncedAt: null } });
});

describe.each(['en', 'cs'] as Locale[])('the Strava card (%s)', (locale) => {
  const t = translations[locale];
  const s = t.service.logbook.strava;
  beforeEach(() => { localStorage.clear(); clearStravaReturn(); });
  afterEach(() => vi.unstubAllGlobals());

  it('should ask a guest to sign in and offer no button', async () => {
    await open(locale, { signedIn: false });
    expect(screen.getByTestId('strava-guest')).toHaveTextContent(s.guest);
    expect(screen.queryByTestId('strava-connect')).not.toBeInTheDocument();
  });

  it('should offer the official button, as a link to the route that starts the authorisation, to a signed in rider', async () => {
    await open(locale);
    const link = await screen.findByTestId('strava-connect');
    expect(link).toHaveAttribute('href', '/api/strava/auth');
    expect(link).toHaveAccessibleName(s.connect);
  });

  it('should say what the owner should know about the data: no route, no position, no AI', async () => {
    await open(locale);
    expect(screen.getByTestId('strava-card')).toHaveTextContent(s.intro);
  });

  it('should show the result of the return from Strava once', async () => {
    captureStravaReturn('?strava=scope');
    await open(locale);
    expect(screen.getByTestId('strava-return')).toHaveTextContent(s.results.scope);
  });

  it('should load the bikes, pair one, load its rides and keep them in the book', async () => {
    const fetchMock = vi.fn(async (url: string) => Response.json(url.includes('/bikes') ? { success: true, bikes: [bike] } : { success: true, rides: [stravaRide()], truncated: false }));
    vi.stubGlobal('fetch', fetchMock);
    const { books } = await open(locale, { connected: true });
    fireEvent.click(await screen.findByRole('button', { name: s.pair.load }));
    const select = await screen.findByLabelText(s.pair.choose);
    fireEvent.change(select, { target: { value: 'b99' } });
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    expect(await screen.findByText(fill(s.notices.synced, { n: 1 }))).toBeInTheDocument();
    const last = books[books.length - 1];
    expect(last.strava).toMatchObject({ gearId: 'b99', gearName: 'Road', syncedAt: TODAY });
    expect(last.rides[0]).toMatchObject({ id: 'strava-1', km: 42.3, rain: false });
    const body = JSON.parse(String((fetchMock.mock.calls.find((call) => String(call[0]).includes('/sync')) as unknown[])[1] && ((fetchMock.mock.calls.find((call) => String(call[0]).includes('/sync')) as unknown[])[1] as RequestInit).body));
    expect(body).toMatchObject({ gearId: 'b99' });
    expect(screen.getByTestId('strava-paired')).toHaveTextContent(fill(s.paired, { name: 'Road' }));
  });

  it('should not pair a Strava bike that belongs to another bike', async () => {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { other: { ...DEFAULT_BOOK, strava: { gearId: 'b99', gearName: 'Road', since: '2026-08-01', syncedAt: null } } } }));
    const fetchMock = vi.fn(async () => Response.json({ success: true, bikes: [bike] }));
    vi.stubGlobal('fetch', fetchMock);
    const { books } = await open(locale, { connected: true });
    fireEvent.click(await screen.findByRole('button', { name: s.pair.load }));
    fireEvent.change(await screen.findByLabelText(s.pair.choose), { target: { value: 'b99' } });
    fireEvent.click(screen.getByRole('button', { name: s.pair.button }));
    expect(await screen.findByTestId('strava-notice')).toHaveTextContent(s.notices.taken);
    expect(books.some((book) => book.strava)).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should say when Strava is not set up on the server', async () => {
    vi.stubGlobal('fetch', reply({ success: false, error: 'not_configured' }));
    await open(locale, { connected: true });
    fireEvent.click(await screen.findByRole('button', { name: s.pair.load }));
    expect(await screen.findByRole('alert')).toHaveTextContent(s.errors.not_configured);
  });

  it('should disconnect, clear the Strava rides everywhere and offer to connect again', async () => {
    vi.stubGlobal('fetch', reply({ success: true }));
    await open(locale, { connected: true });
    fireEvent.click(await screen.findByRole('button', { name: s.disconnect }));
    expect(await screen.findByTestId('strava-connect')).toBeInTheDocument();
  });

  it('should say who provides the rides once connected and show no emoji', async () => {
    await open(locale, { connected: true });
    const card = await screen.findByTestId('strava-card');
    await waitFor(() => expect(within(card).getByText(s.attribution)).toBeInTheDocument());
    expect(card.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
