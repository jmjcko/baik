import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { decideConsent, readConsents, writeConsents } from '@/lib/consent/useConsent';
import { stateOf } from '@/lib/consent/consentStore';
import { saveCreds } from '@/lib/intervals/keyStore';
import { DEFAULT_BOOK } from '@/types/service';
import { IntervalsConnectCard } from '../IntervalsConnectCard';

const card = (locale: Locale) => render(<IntervalsConnectCard t={translations[locale]} bikeId="b" book={DEFAULT_BOOK} update={() => undefined} today="2026-11-10" />);

describe.each(['en', 'cs'] as Locale[])('the consent of a rider who is already connected (%s)', (locale) => {
  beforeEach(() => { localStorage.clear(); saveCreds({ athleteId: '0', key: 'abcdefgh12345' }); });

  it('should ask again when the agreement is for an older text, and stop asking after the rider agrees', () => {
    writeConsents({ intervals: { granted: true, version: 2, decidedAt: '2026-11-09T10:00:00.000Z' } });
    card(locale);
    expect(screen.getByTestId('consent-prompt-intervals')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: translations[locale].consent.prompt.allow }));
    expect(screen.queryByTestId('consent-prompt-intervals')).not.toBeInTheDocument();
    expect(stateOf(readConsents(), 'intervals')).toBe('granted');
  });

  it('should not ask a rider who agreed to the current text', () => {
    decideConsent('intervals', true);
    card(locale);
    expect(screen.queryByTestId('consent-prompt-intervals')).not.toBeInTheDocument();
  });
});
