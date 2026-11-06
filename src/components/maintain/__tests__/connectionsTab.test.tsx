import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { BOOK_STORAGE_KEY } from '@/lib/service/bookStore';
import { captureStravaReturn, clearStravaReturn } from '@/lib/strava/returnFlag';
import { DEFAULT_BOOK } from '@/types/service';
import { DEFAULT_CARE } from '@/types/maintain';
import { MaintainView } from '../MaintainView';
import { NO_FIT } from '@/test/noFit';
import { go, openGarage } from '@/test/garageHarness';

const seedBook = (over: Record<string, unknown>) => localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify({ version: 1, bikes: { current: { ...DEFAULT_BOOK, ...over } } }));
const intervalsRule = { gearId: null, gearName: null, types: ['road'], since: '2026-09-01', syncedAt: null };

describe.each(['en', 'cs'] as Locale[])('the Connections tab of the garage (%s)', (locale) => {
  const t = translations[locale];
  const c = t.connections;
  beforeEach(() => localStorage.clear());
  afterEach(() => clearStravaReturn());

  it('should be the fifth tab, right after Wear, named in the language of the rider', () => {
    openGarage(locale);
    const tabs = within(screen.getByRole('tablist', { name: t.service.garageTabs.label })).getAllByRole('tab').map((tab) => tab.getAttribute('data-testid'));
    expect(tabs).toEqual(['overview', 'log', 'wear', 'connections', 'intervals'].map((id) => `garage-tab-${id}`));
    expect(screen.getByTestId('garage-tab-connections')).toHaveTextContent(t.service.garageTabs.connections);
  });

  it('should hold the cards of Intervals.icu and Strava, each with the state in words, and the summary', () => {
    openGarage(locale, undefined, 'connections');
    expect(screen.getByTestId('connections')).toHaveTextContent(c.intro);
    expect(screen.getByTestId('intervals-card')).toBeInTheDocument();
    expect(screen.getByTestId('strava-card')).toBeInTheDocument();
    expect(screen.getByTestId('intervals-state')).toHaveTextContent(c.states.disconnected);
    expect(screen.getByTestId('strava-state').textContent).toBeTruthy();
    expect(screen.getByTestId('connections-summary')).toHaveTextContent(c.summaryNone);
  });

  it('should mark Strava as beta, with the note about the subscription, and not Intervals.icu', () => {
    openGarage(locale, undefined, 'connections');
    expect(screen.getByTestId('strava-beta')).toHaveTextContent(t.service.logbook.strava.beta);
    expect(screen.getByTestId('strava-beta-note')).toHaveTextContent(t.service.logbook.strava.betaNote);
    expect(within(screen.getByTestId('intervals-card')).queryByText(t.service.logbook.strava.beta)).not.toBeInTheDocument();
  });

  it('should count the services that bring rides to this bike', () => {
    seedBook({ intervals: intervalsRule });
    openGarage(locale, undefined, 'connections');
    expect(screen.getByTestId('connections-summary')).toHaveTextContent(fill(c.summary, { n: 1, total: 2 }));
  });

  it('should no longer have the cards in the Wear tab, but a pointer that opens the Connections tab', () => {
    openGarage(locale, undefined, 'wear');
    expect(screen.queryByTestId('intervals-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('strava-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('connections-pointer')).toHaveTextContent(c.pointer);
    fireEvent.click(screen.getByTestId('connections-open'));
    expect(screen.getByTestId('garage-tab-connections')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('strava-card')).toBeInTheDocument();
  });

  it('should drop the pointer once a service feeds the bike', () => {
    seedBook({ intervals: intervalsRule });
    openGarage(locale, undefined, 'wear');
    expect(screen.queryByTestId('connections-pointer')).not.toBeInTheDocument();
  });

  it('should open on the Connections tab when the rider comes back from Strava', () => {
    captureStravaReturn('?strava=connected');
    render(<MaintainView locale={locale} t={t} fit={NO_FIT} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={vi.fn()} today="2026-10-29" />);
    expect(screen.getByTestId('garage-tab-connections')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('strava-return')).toHaveTextContent(t.service.logbook.strava.results.connected);
    go('wear');
    expect(screen.queryByTestId('strava-card')).not.toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('the Edit bike button of the garage (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => localStorage.clear());

  it('should be in the header of the garage when the page can edit, and open the dialog of the page', () => {
    const onEditBike = vi.fn();
    render(<MaintainView locale={locale} t={t} fit={NO_FIT} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={vi.fn()} today="2026-10-29" onEditBike={onEditBike} />);
    fireEvent.click(screen.getByTestId('care-tab-garage'));
    expect(screen.getByTestId('garage-edit-bike')).toHaveTextContent(t.bikeEdit.button);
    fireEvent.click(screen.getByTestId('garage-edit-bike'));
    expect(onEditBike).toHaveBeenCalledTimes(1);
  });

  it('should be absent when the page gives no way to edit', () => {
    render(<MaintainView locale={locale} t={t} fit={NO_FIT} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={vi.fn()} today="2026-10-29" />);
    fireEvent.click(screen.getByTestId('care-tab-garage'));
    expect(screen.queryByTestId('garage-edit-bike')).not.toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('the page of a bike picked in Riding now (%s)', (locale) => {
  const t = translations[locale];
  beforeEach(() => localStorage.clear());
  const view = (garageRequested: boolean, onGarageShown = vi.fn()) => <MaintainView locale={locale} t={t} fit={NO_FIT} bikeId="current" bikeName="Road bike" kind="road" discipline="road" riderWeightKg={75} care={DEFAULT_CARE} onCareChange={vi.fn()} today="2026-10-29" garageRequested={garageRequested} onGarageShown={onGarageShown} />;

  it('should open on the Garage when the page is opened for the bike, and say that it did', () => {
    const shown = vi.fn();
    render(view(true, shown));
    expect(screen.getByTestId('garage-section')).toBeInTheDocument();
    expect(shown).toHaveBeenCalled();
  });

  it('should move from the workshop to the Garage when a bike is picked while the page is open, and not again after it was shown', () => {
    const { rerender } = render(view(false));
    expect(screen.getByTestId('care-tab-workshop')).toHaveAttribute('aria-selected', 'true');
    rerender(view(true));
    expect(screen.getByTestId('garage-section')).toBeInTheDocument();
    rerender(view(false));
    fireEvent.click(screen.getByTestId('care-tab-workshop'));
    expect(screen.queryByTestId('garage-section')).not.toBeInTheDocument();
  });
});
