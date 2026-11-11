import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { saveCreds } from '@/lib/intervals/keyStore';
import { decideConsent } from '@/lib/consent/useConsent';
import { AUTOLOAD_HOURS, dueForAutoLoad, markAutoLoaded, resetAutoLoad } from '@/lib/service/autoLoadStore';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { AutoLoad } from '../AutoLoad';

const TODAY = '2026-11-05';
const stravaPaired: BikeBook = { ...DEFAULT_BOOK, strava: { gearId: 'b99', gearName: 'Road', since: '2026-08-01', syncedAt: null } };
const intervalsPaired: BikeBook = { ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types: ['road'], since: '2026-08-01', syncedAt: null } };
const stravaRide = { id: 'strava-1', date: '2026-10-20', terrain: 'road', km: 42.3, elevationM: 512, gearId: 'b99' };
const icuRide = { id: 'icu-9', date: '2026-10-21', terrain: 'road', km: 30, elevationM: 100, gearId: null, gearName: null };

function stubFetch(handlers: Record<string, () => Response>) {
  const urls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    urls.push(String(url));
    const key = Object.keys(handlers).find((path) => String(url).includes(path));
    return key ? handlers[key]() : new Response('', { status: 500 });
  }));
  return urls;
}

let latest: BikeBook = DEFAULT_BOOK;
function Host({ locale, initial, bikeId = 'bike-1' }: { locale: Locale; initial: BikeBook; bikeId?: string }) {
  const [book, setBook] = React.useState(initial);
  React.useEffect(() => { latest = book; });
  return <AutoLoad t={translations[locale]} bikeId={bikeId} book={book} update={(change) => setBook((previous) => change(previous))} today={TODAY} riderId="me" />;
}

async function mount(locale: Locale, initial: BikeBook, signedIn: boolean, bikeId?: string) {
  const fake = fakeAuthClient();
  render(<AuthProvider client={fake.client as AuthClient}><Host locale={locale} initial={initial} bikeId={bikeId} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', signedIn ? riderSession : null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
}

describe('the schedule of the automatic load', () => {
  beforeEach(() => { localStorage.clear(); resetAutoLoad(); });

  it('should be due on a device that never loaded and again only after the hours have passed', () => {
    const start = Date.parse('2026-11-05T08:00:00Z');
    expect(dueForAutoLoad('a', start)).toBe(true);
    markAutoLoaded('a', start);
    expect(dueForAutoLoad('a', start + (AUTOLOAD_HOURS * 3_600_000 - 1))).toBe(false);
    expect(dueForAutoLoad('a', start + AUTOLOAD_HOURS * 3_600_000)).toBe(true);
    expect(dueForAutoLoad('another-bike', start)).toBe(true);
  });
});

describe.each(['en', 'cs'] as Locale[])('the rides that load when the garage opens (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => { localStorage.clear(); resetAutoLoad(); decideConsent('intervals', true); decideConsent('strava', true); });
  afterEach(() => vi.unstubAllGlobals());

  it('should load the rides of a bike paired with Strava for a signed in rider and say how many are new', async () => {
    const urls = stubFetch({ '/api/strava/sync': () => Response.json({ success: true, rides: [stravaRide], truncated: false }) });
    await mount(locale, stravaPaired, true);
    expect(await screen.findByRole('status')).toHaveTextContent(fill(t.service.logbook.intervals.server.autoLoaded, { n: 1, source: 'Strava' }));
    expect(urls).toEqual(['/api/strava/sync']);
    expect(latest.rides.map((ride) => ride.id)).toEqual(['strava-1']);
    expect(latest.strava?.syncedAt).toBe(TODAY);
  });

  it('should load the rides through the server for a rider whose Intervals.icu key is in the account', async () => {
    const urls = stubFetch({ '/api/intervals/sync': () => Response.json({ success: true, rides: [icuRide] }) });
    await mount(locale, intervalsPaired, true);
    expect(await screen.findByRole('status')).toHaveTextContent(fill(t.service.logbook.intervals.server.autoLoaded, { n: 1, source: 'Intervals.icu' }));
    expect(urls).toEqual(['/api/intervals/sync']);
    expect(latest.rides.map((ride) => ride.id)).toEqual(['icu-9']);
  });

  it('should read Intervals.icu directly with the key of the browser for a guest, and call no route of the server', async () => {
    saveCreds({ athleteId: '0', key: 'abcdefgh12345' });
    const urls = stubFetch({ 'intervals.icu/api/v1': () => Response.json([{ id: 'i9', type: 'Ride', distance: 30_000, total_elevation_gain: 100, start_date_local: '2026-10-21T07:00:00' }]) });
    await mount(locale, intervalsPaired, false);
    await waitFor(() => expect(latest.rides).toHaveLength(1));
    expect(urls.every((url) => url.startsWith('https://intervals.icu/'))).toBe(true);
  });

  it('should not load the rides of a Strava bike for a rider who has not agreed to the current text', async () => {
    const urls = stubFetch({});
    decideConsent('strava', false);
    await mount(locale, stravaPaired, true);
    await act(async () => { await Promise.resolve(); });
    expect(urls).toEqual([]);
  });

  it('should call neither Intervals.icu nor the server when the consent for the current text is missing or declined', async () => {
    saveCreds({ athleteId: '0', key: 'abcdefgh12345' });
    const urls = stubFetch({});
    decideConsent('intervals', false);
    await mount(locale, intervalsPaired, false);
    await mount(locale, intervalsPaired, true, 'bike-2');
    await act(async () => { await Promise.resolve(); });
    expect(urls).toEqual([]);
  });

  it('should call nothing for a guest with a Strava bike, for a guest without a key, and for a bike with no pairing', async () => {
    const urls = stubFetch({});
    await mount(locale, stravaPaired, false);
    await mount(locale, intervalsPaired, false, 'bike-2');
    await mount(locale, DEFAULT_BOOK, true, 'bike-3');
    await act(async () => { await Promise.resolve(); });
    expect(urls).toEqual([]);
  });

  it('should not load again on this device before the hours have passed', async () => {
    const urls = stubFetch({ '/api/strava/sync': () => Response.json({ success: true, rides: [], truncated: false }) });
    await mount(locale, stravaPaired, true);
    await waitFor(() => expect(urls).toHaveLength(1));
    await mount(locale, stravaPaired, true);
    await act(async () => { await Promise.resolve(); });
    expect(urls).toHaveLength(1);
  });

  it('should say nothing when nothing new came or when the service failed', async () => {
    stubFetch({ '/api/strava/sync': () => Response.json({ success: false, error: 'unavailable' }, { status: 502 }) });
    await mount(locale, stravaPaired, true);
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(latest.rides).toEqual([]);
  });
});
