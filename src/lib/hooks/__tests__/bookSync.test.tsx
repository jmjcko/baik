import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { decideConsent } from '@/lib/consent/useConsent';
import { BOOK_STORAGE_KEY, listBooks, loadBook, saveBook } from '@/lib/service/bookStore';
import { BookSyncNotice } from '@/components/service/BookSyncNotice';
import { DEFAULT_BOOK, type BikeBook, type ServiceEntry } from '@/types/service';
import { resetBookSync, useBookSync } from '../useBookSync';

const entry = (id: string, at: string): ServiceEntry => ({ id, kind: 'chain', variant: null, at, value: null, price: null, currency: null, warrantyUntil: null, note: '' });
const book = (over: Partial<BikeBook> = {}): BikeBook => ({ ...DEFAULT_BOOK, ...over });
const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-02T10:00:00.000Z';
const t = translations.en;

const Probe: React.FC = () => {
  const sync = useBookSync();
  return <BookSyncNotice t={t} sync={sync} />;
};

/** A fake Supabase with a table `bike_books`; `rows` is what the account holds, `upsert` shows what the app wrote. */
function setup(rows: Array<Record<string, unknown>> = [], upsertError: { code: string } | null = null) {
  const fake = fakeAuthClient();
  const upsert = vi.fn(async (row: Record<string, unknown>) => (upsertError ? { error: upsertError } : (rows.push({ ...row }), { error: null })));
  const client = { ...fake.client, from: () => ({ select: () => ({ eq: async () => ({ data: rows, error: null }) }), upsert }) } as unknown as AuthClient;
  render(<AuthProvider client={client}><Probe /></AuthProvider>);
  const signIn = async () => {
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', riderSession));
  };
  return { fake, rows, upsert, signIn };
}

describe('the service books follow the account', () => {
  beforeEach(() => { localStorage.clear(); resetBookSync(); });
  afterEach(() => vi.useRealTimers());

  it('should take a book that only the account has into this browser, keep the frame number of this browser, and say so', async () => {
    saveBook('a', book({ identity: { make: 'Cube', model: '', year: null, serial: 'WK123', insurance: '', photo: null } }), new Date(T1));
    const { signIn } = setup([{ bike_id: 'a', updated_at: T2, data: book({ log: [entry('e1', '2026-10-01')] }) }, { bike_id: 'b', updated_at: T2, data: book({ log: [entry('e2', '2026-10-02')] }) }]);
    await signIn();
    await waitFor(() => expect(loadBook('b').log).toHaveLength(1));
    expect(loadBook('a').log).toHaveLength(1);
    expect(loadBook('a').identity.serial).toBe('WK123');
    expect(await screen.findByRole('status')).toHaveTextContent(fill(t.service.bookSync.done, { pulled: 2, pushed: 0 }));
  });

  it('should send a book that only this browser has, without the frame number', async () => {
    saveBook('a', book({ log: [entry('e1', '2026-10-01')], identity: { make: 'Cube', model: '', year: null, serial: 'WK123', insurance: '', photo: null } }), new Date(T1));
    const { signIn, upsert } = setup([]);
    await signIn();
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(upsert.mock.calls[0][0]).toMatchObject({ user_id: 'u1', bike_id: 'a', updated_at: T1 });
    expect(JSON.stringify(upsert.mock.calls[0][0])).not.toContain('WK123');
  });

  it('should put together a book of unknown time with the book of the account, so that the rides of both devices stay (the data from localhost)', async () => {
    localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { a: book({ log: [entry('e1', '2026-10-01')] }) } }));
    const { signIn, upsert } = setup([{ bike_id: 'a', updated_at: T2, data: book({ log: [entry('e2', '2026-10-05')] }) }]);
    await signIn();
    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(loadBook('a').log.map((one) => one.id)).toEqual(['e2', 'e1']);
    expect((upsert.mock.calls[0][0] as { data: BikeBook }).data.log).toHaveLength(2);
  });

  it('should write a change of a book to the account after a short delay, once', async () => {
    const { signIn, upsert } = setup([]);
    await signIn();
    vi.useFakeTimers();
    act(() => { saveBook('a', book({ log: [entry('e1', '2026-10-01')] })); saveBook('a', book({ log: [entry('e1', '2026-10-01'), entry('e2', '2026-10-02')] })); });
    expect(upsert).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect((upsert.mock.calls[0][0] as { data: BikeBook }).data.log).toHaveLength(2);
  });

  it('should remove the books from this browser after sign out when everything was saved', async () => {
    saveBook('a', book({ log: [entry('e1', '2026-10-01')] }), new Date(T1));
    const { fake, signIn, upsert } = setup([]);
    await signIn();
    await waitFor(() => expect(upsert).toHaveBeenCalled());
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(listBooks()).toEqual([]);
  });

  it('should keep a book in this browser after sign out when the account refused it, and say so', async () => {
    saveBook('a', book({ log: [entry('e1', '2026-10-01')] }), new Date(T1));
    const { fake, signIn, upsert } = setup([], { code: '500' });
    await signIn();
    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(await screen.findByRole('alert')).toHaveTextContent(t.service.bookSync.error);
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(loadBook('a').log).toHaveLength(1);
  });

  it('should send nothing for a guest, who keeps the books in this browser', async () => {
    const { upsert } = setup([]);
    vi.useFakeTimers();
    act(() => { saveBook('a', book({ log: [entry('e1', '2026-10-01')] })); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(upsert).not.toHaveBeenCalled();
    expect(loadBook('a').log).toHaveLength(1);
  });

  it('should touch nothing in the account after the consent to the storage was withdrawn', async () => {
    decideConsent('health_storage', false);
    saveBook('a', book({ log: [entry('e1', '2026-10-01')] }), new Date(T1));
    const { signIn, upsert } = setup([{ bike_id: 'b', updated_at: T2, data: book({ log: [entry('e2', '2026-10-02')] }) }]);
    await signIn();
    await act(async () => { await Promise.resolve(); });
    expect(upsert).not.toHaveBeenCalled();
    expect(loadBook('b').log).toHaveLength(0);
  });
});
