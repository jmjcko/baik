import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { decideConsent, readConsents, resetConsents } from '@/lib/consent/useConsent';
import { useConsentSync } from '@/lib/consent/useConsentSync';
import { stateOf } from '@/lib/consent/consentStore';
import { HealthConsentAsk } from '../HealthConsentAsk';

const AGREED = { purpose: 'health_storage', text_version: 1, granted: true, decided_at: '2026-11-01T10:00:00.000Z' };

const Probe: React.FC<{ locale: Locale }> = ({ locale }) => {
  const settled = useConsentSync();
  return <HealthConsentAsk t={translations[locale]} ready={settled} />;
};

function mount(locale: Locale, { rows = [] as unknown[], error = false, signedIn = true } = {}) {
  const fake = fakeAuthClient();
  const upsert = vi.fn(async () => ({ error: null }));
  const answer = error ? { data: null, error: { message: 'denied' } } : { data: rows, error: null };
  const client = { ...fake.client, from: () => ({ select: () => ({ eq: async () => answer }), upsert }) } as unknown as AuthClient;
  render(<AuthProvider client={client}><Probe locale={locale} /></AuthProvider>);
  if (signedIn) act(() => fake.emit('SIGNED_IN', riderSession));
  return { upsert };
}

describe.each(['en', 'cs'] as Locale[])('asking an older account for the consent to store data (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => resetConsents());

  it('should ask once, with the text of the consent and what a refusal means, when neither this browser nor the account has an answer', async () => {
    mount(locale);
    const card = await screen.findByTestId('consent-prompt-health_storage');
    expect(card).toHaveTextContent(t.consent.healthAsk.title);
    expect(card).toHaveTextContent(t.consent.healthAsk.note);
    expect(card).toHaveTextContent(t.consent.purposes.health_storage.body);
  });

  it('should record "agree" in the browser and send it to the account, and go away', async () => {
    const { upsert } = mount(locale);
    fireEvent.click(await screen.findByRole('button', { name: t.consent.prompt.allow }));
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
    expect(stateOf(readConsents(), 'health_storage')).toBe('granted');
    await waitFor(() => expect(upsert).toHaveBeenCalled());
  });

  it('should record "do not agree" and go away', async () => {
    mount(locale);
    fireEvent.click(await screen.findByRole('button', { name: t.consent.prompt.decline }));
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
    expect(stateOf(readConsents(), 'health_storage')).toBe('declined');
  });

  it('should never ask a rider whose account already holds the answer', async () => {
    mount(locale, { rows: [AGREED] });
    await waitFor(() => expect(stateOf(readConsents(), 'health_storage')).toBe('granted'));
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
  });

  it('should not ask a rider who answered in this browser, a guest, or when the account cannot be read', async () => {
    decideConsent('health_storage', true);
    mount(locale);
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
    resetConsents();
  });

  it('should not ask a guest', async () => {
    mount(locale, { signedIn: false });
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
  });

  it('should not ask while the account cannot be read, so that a rider who has answered is not asked by mistake', async () => {
    mount(locale, { error: true });
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId('consent-prompt-health_storage')).not.toBeInTheDocument();
  });
});
