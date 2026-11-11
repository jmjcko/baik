import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { decideConsent, readConsents, writeConsents } from '@/lib/consent/useConsent';
import { stateOf } from '@/lib/consent/consentStore';
import { saveCreds } from '@/lib/intervals/keyStore';
import { DEFAULT_BOOK, type BikeBook } from '@/types/service';
import { IntervalsConnectCard } from '../IntervalsConnectCard';

const PAIRED: BikeBook = { ...DEFAULT_BOOK, intervals: { gearId: null, gearName: null, types: ['road'], since: '2026-10-01', syncedAt: null } };
const card = (locale: Locale, book: BikeBook = DEFAULT_BOOK) => render(<IntervalsConnectCard t={translations[locale]} bikeId="b" book={book} update={() => undefined} today="2026-11-10" />);

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

  it('should hide every function of a connected rider who has not agreed to the current text, and keep the way to forget the key', () => {
    writeConsents({ intervals: { granted: false, version: 3, decidedAt: '2026-11-10T10:00:00.000Z' } });
    card(locale, PAIRED);
    const texts = translations[locale].service.logbook.intervals;
    expect(screen.getByTestId('consent-prompt-intervals')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: texts.sync })).not.toBeInTheDocument();
    expect(screen.queryByTestId('intervals-paired')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: texts.forget })).toBeInTheDocument();
  });

  it('should show the controls of a paired bike once the rider agrees', () => {
    writeConsents({ intervals: { granted: true, version: 2, decidedAt: '2026-11-09T10:00:00.000Z' } });
    card(locale, PAIRED);
    fireEvent.click(screen.getByRole('button', { name: translations[locale].consent.prompt.allow }));
    expect(screen.getByRole('button', { name: translations[locale].service.logbook.intervals.sync })).toBeInTheDocument();
  });
});
