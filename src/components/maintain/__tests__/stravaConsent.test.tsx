import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { decideConsent, readConsents, resetConsents } from '@/lib/consent/useConsent';
import { stateOf } from '@/lib/consent/consentStore';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { DEFAULT_BOOK } from '@/types/service';
import { StravaConnectCard } from '../StravaConnectCard';

async function openConnected(locale: Locale) {
  const fake = fakeAuthClient();
  fake.database.tables.strava_connections = [{ athlete_id: 777 }];
  render(<AuthProvider client={fake.client}><StravaConnectCard t={translations[locale]} bikeId="b" book={DEFAULT_BOOK} update={() => undefined} today="2026-11-05" /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  await act(async () => fake.emit('SIGNED_IN', riderSession));
}

describe.each(['en', 'cs'] as Locale[])('the consent of a rider who is already connected to Strava (%s)', (locale) => {
  const texts = translations[locale].service.logbook.strava;
  beforeEach(() => resetConsents());

  it('should ask first and show neither the pairing nor the update, but keep the way to disconnect', async () => {
    await openConnected(locale);
    expect(await screen.findByTestId('consent-prompt-strava')).toBeInTheDocument();
    expect(screen.queryByText(texts.pair.title)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: texts.disconnect })).toBeInTheDocument();
  });

  it('should show the pairing after the rider agrees', async () => {
    await openConnected(locale);
    fireEvent.click(await screen.findByRole('button', { name: translations[locale].consent.prompt.allow }));
    expect(screen.getByText(texts.pair.title)).toBeInTheDocument();
    expect(stateOf(readConsents(), 'strava')).toBe('granted');
  });

  it('should show the pairing at once for a rider who agreed to the current text', async () => {
    decideConsent('strava', true);
    await openConnected(locale);
    expect(await screen.findByText(texts.pair.title)).toBeInTheDocument();
    expect(screen.queryByTestId('consent-prompt-strava')).not.toBeInTheDocument();
  });
});
