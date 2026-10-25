import React from 'react';
import { render, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { AdminCatalog } from '../AdminCatalog';

export const spec = { ...STOCK_BIKE_SPECS[0].sizes.M, frameStackMm: 575, frameReachMm: 374, stockHandlebarMm: 420, stockCrankMm: 170 };
export const submission = (id: string, userId: string | null, over: Record<string, unknown> = {}) => ({
  id, user_id: userId, brand: 'Cube', model: 'Attain GTC', year: 2024, size: '54', key: 'cube|attaingtc|2024|54', spec, status: 'pending', catalog_id: null, review_note: null, created_at: '2026-10-23T10:00:00Z', ...over,
});
export const catalogRow = (over: Record<string, unknown> = {}) => ({ id: 'c1', brand: 'Trek', model: 'Domane', year: 2024, size: '56', key: 'trek|domane|2024|56', spec: { ...spec, frameStackMm: 591 }, origin: 'owner', confirmations: 0, note: 'trekbikes.com', ...over });

export async function setup(locale: Locale, { admin = true, signedIn = true, broken = false, pending = [] as Array<Record<string, unknown>>, catalog = [] as Array<Record<string, unknown>>, misses = [] as Array<Record<string, unknown>> } = {}) {
  const fake = fakeAuthClient();
  if (broken) fake.database.tableError.current = { code: '500' };
  fake.database.rpcResults.is_admin = { data: admin };
  fake.database.tables.bike_submissions = pending;
  fake.database.tables.bike_catalog = catalog;
  fake.database.tables.bike_misses = misses;
  render(<AuthProvider client={fake.client}><AdminCatalog t={translations[locale]} locale={locale} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
  return fake;
}

