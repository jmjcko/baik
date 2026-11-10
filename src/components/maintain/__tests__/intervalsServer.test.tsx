import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { decideConsent } from '@/lib/consent/useConsent';
import { translations, type Locale } from '@/lib/i18n/translations';
import { loadCreds, saveCreds } from '@/lib/intervals/keyStore';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { IntervalsConnectCard } from '../IntervalsConnectCard';

const TODAY = '2026-11-05';
const ride = { id: 'icu-i101', date: '2026-10-25', terrain: 'gravel', km: 62.4, elevationM: 780, gearId: 'b1', gearName: 'Grizl' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A fetch that answers the routes of bAIk and (if asked) Intervals.icu itself; `calls` lists what was asked. */
function stubFetch(handlers: Record<string, () => Response>) {
  const calls: Array<{ url: string; body: Record<string, unknown> | null }> = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null });
    const key = Object.keys(handlers).find((path) => String(url).includes(path));
    return key ? handlers[key]() : new Response('', { status: 500 });
  }));
  return calls;
}

function Host({ locale, initial = DEFAULT_BOOK }: { locale: Locale; initial?: BikeBook }) {
  const [book, setBook] = React.useState<BikeBook>(initial);
  return <IntervalsConnectCard t={translations[locale]} bikeId="current" book={book} update={(change) => setBook((previous) => change(previous))} today={TODAY} />;
}

/** The card of a signed in rider; `riders` is what the table `intervals_connections` holds for the account. */
async function openSignedIn(locale: Locale, riders: string[] = [], initial?: BikeBook) {
  const fake = fakeAuthClient();
  const client = { ...fake.client, from: () => ({ select: () => Promise.resolve({ data: riders.map((rider_id) => ({ rider_id })), error: null }) }) } as unknown as AuthClient;
  render(<AuthProvider client={client}><Host locale={locale} initial={initial} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  await act(async () => fake.emit('SIGNED_IN', riderSession));
}

describe.each(['en', 'cs'] as Locale[])('the Intervals.icu card with the key in the account (%s)', (locale) => {
  const t = translations[locale];
  const s = t.service.logbook.intervals;
  const connect = async () => {
    fireEvent.change(await screen.findByLabelText(s.form.key), { target: { value: 'abcdefgh12345' } });
    fireEvent.click(screen.getByRole('button', { name: s.form.load }));
  };
  beforeEach(() => { localStorage.clear(); decideConsent('intervals', true); });
  afterEach(() => vi.unstubAllGlobals());

  it('should send the key to the server once, keep nothing in the browser and say that the key is in the account', async () => {
    const calls = stubFetch({ '/api/intervals/connect': () => json({ success: true, rides: [ride] }) });
    await openSignedIn(locale);
    await connect();
    expect(await screen.findByTestId('intervals-in-account')).toHaveTextContent(s.server.stored);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/api/intervals/connect');
    expect(calls[0].body).toMatchObject({ riderId: 'me', athleteId: '0', key: 'abcdefgh12345', newest: TODAY });
    expect(loadCreds()).toBeNull();
    expect(within(await screen.findByLabelText(s.pair.gear)).getAllByRole('option').map((o) => o.textContent)).toEqual([s.pair.anyGear, 'Grizl']);
  });

  it('should not keep a key that Intervals.icu refused, and say so', async () => {
    stubFetch({ '/api/intervals/connect': () => json({ success: false, error: 'key_rejected' }, 422) });
    await openSignedIn(locale);
    await connect();
    expect(await screen.findByRole('alert')).toHaveTextContent(s.errors.unauthorized);
    expect(loadCreds()).toBeNull();
    expect(screen.queryByTestId('intervals-in-account')).not.toBeInTheDocument();
  });

  it('should keep the key in the browser, as before, when the server is not set up for it', async () => {
    const calls = stubFetch({ '/api/intervals/connect': () => json({ success: false, error: 'not_configured' }, 503), 'intervals.icu/api/v1': () => json([]) });
    await openSignedIn(locale);
    await connect();
    await waitFor(() => expect(loadCreds()).toEqual({ athleteId: '0', key: 'abcdefgh12345' }));
    expect(calls.map((call) => call.url.startsWith('http') ? 'intervals' : call.url)).toEqual(['/api/intervals/connect', 'intervals']);
    expect(screen.queryByTestId('intervals-in-account')).not.toBeInTheDocument();
  });

  it('should read the rides through the server for a rider whose key is in the account, without any key in the browser', async () => {
    const calls = stubFetch({ '/api/intervals/sync': () => json({ success: true, rides: [ride] }) });
    await openSignedIn(locale, ['me']);
    expect(await screen.findByTestId('intervals-in-account')).toBeInTheDocument();
    expect(screen.queryByTestId('intervals-key-form')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: s.pair.loadGears }));
    expect(await screen.findByLabelText(s.pair.gear)).toBeInTheDocument();
    expect(calls[0].url).toBe('/api/intervals/sync');
    expect(calls.every((call) => !call.url.startsWith('http'))).toBe(true);
  });

  it('should move a key that is still in the browser to the account and remove it from the browser', async () => {
    saveCreds({ athleteId: 'i123', key: 'abcdefgh12345' });
    const calls = stubFetch({ '/api/intervals/connect': () => json({ success: true, rides: [] }) });
    await openSignedIn(locale);
    const move = await screen.findByTestId('intervals-move');
    expect(move).toHaveTextContent(s.server.moveHint);
    fireEvent.click(within(move).getByRole('button', { name: s.server.move }));
    expect(await screen.findByTestId('intervals-in-account')).toBeInTheDocument();
    expect(calls[0].body).toMatchObject({ athleteId: 'i123', key: 'abcdefgh12345' });
    expect(loadCreds()).toBeNull();
    expect(screen.queryByTestId('intervals-move')).not.toBeInTheDocument();
  });

  it('should delete the stored key on the server when the rider forgets it, and offer the key form again', async () => {
    const calls = stubFetch({ '/api/intervals/disconnect': () => json({ success: true }) });
    await openSignedIn(locale, ['me']);
    fireEvent.click(await screen.findByRole('button', { name: s.forget }));
    expect(await screen.findByTestId('intervals-key-form')).toBeInTheDocument();
    expect(calls[0]).toMatchObject({ url: '/api/intervals/disconnect', body: { riderId: 'me' } });
  });

  it('should keep the connection and say so when the server could not delete the key', async () => {
    stubFetch({ '/api/intervals/disconnect': () => json({ success: false, error: 'unavailable' }, 500) });
    await openSignedIn(locale, ['me']);
    fireEvent.click(await screen.findByRole('button', { name: s.forget }));
    expect(await screen.findByRole('alert')).toHaveTextContent(s.errors.unavailable);
    expect(screen.getByTestId('intervals-in-account')).toBeInTheDocument();
  });

  it('should show no emoji', async () => {
    stubFetch({});
    await openSignedIn(locale, ['me']);
    expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
